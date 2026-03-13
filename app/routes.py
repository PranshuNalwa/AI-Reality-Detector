"""
Application routes for the AI Reality Distortion Detector.
"""

import os
from flask import (
    render_template,
    redirect,
    url_for,
    flash,
    request,
    abort,
    current_app,
    jsonify
)
from app import app, db
from app.models import Scan
from app.forms import UploadForm
from app.utils.helpers import save_upload, delete_file
from app.utils.metadata_extractor import extract_metadata
from app.utils.image_analysis import analyze_with_sightengine
from app.qr_checker import decode_qr_image, analyze_payment_qr
from app.utils.api_clients import check_url_safety
from app.utils.fact_checker import get_factcheck_results
from app.website_checker import verify_website


# ── Home / Upload ───────────────────────────────────────────────
@app.route("/", methods=["GET", "POST"])
def index():
    """Render the upload page and handle image submissions."""
    form = UploadForm()

    if form.validate_on_submit():
        file = form.image.data

        # Save the uploaded file temporarily
        upload_folder = current_app.config["UPLOAD_FOLDER"]
        file_path = save_upload(file, upload_folder)
        original_name = file.filename

        try:
            # 1. Extract EXIF metadata
            metadata = extract_metadata(file_path)

            # 2. Analyse with Sightengine API
            score, api_response = analyze_with_sightengine(file_path)

            # If the API returned an error, flash it but still save the scan
            if score == -1:
                error_msg = api_response.get("error", "Analysis failed.")
                flash(error_msg, "warning")
                score = 0  # Default to 0 when API is unavailable

            # 3. Persist the scan record
            scan = Scan(
                filename=original_name,
                manipulation_score=score,
                result_json=api_response,
                metadata_json=metadata,
            )
            db.session.add(scan)
            db.session.commit()

            return redirect(url_for("result", scan_id=scan.id))

        except Exception as exc:
            flash(f"Something went wrong: {str(exc)}", "danger")
            return redirect(url_for("index"))

        finally:
            # Always clean up the temporary upload
            delete_file(file_path)

    return render_template("index.html", form=form)


# ── Result detail ───────────────────────────────────────────────
@app.route("/result/<int:scan_id>")
def result(scan_id):
    """Show the analysis results for a specific scan."""
    scan = Scan.query.get_or_404(scan_id)

    # Determine risk level for colour-coding
    if scan.manipulation_score < 30:
        risk_level = "low"
    elif scan.manipulation_score < 70:
        risk_level = "medium"
    else:
        risk_level = "high"

    # Build structured explanations from the API response & metadata
    explanations = _build_explanations(scan, risk_level)

    return render_template(
        "results.html",
        scan=scan,
        risk_level=risk_level,
        explanations=explanations,
    )


# ── History (stretch goal) ──────────────────────────────────────
@app.route("/history")
def history():
    """List all past scans, newest first."""
    scans = Scan.query.order_by(Scan.created_at.desc()).all()
    return render_template("history.html", scans=scans)


# ── Error handlers ──────────────────────────────────────────────
@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404


@app.errorhandler(413)
def file_too_large(e):
    flash("File is too large. Maximum size is 16 MB.", "danger")
    return redirect(url_for("index"))


# ── Helpers ─────────────────────────────────────────────────────
def _build_explanations(scan, risk_level: str) -> dict:
    """
    Build both a non-technical (plain-language) and a technical
    explanation of why the image was flagged or cleared.

    Returns a dict with keys:
        verdict          – one-line human-readable verdict
        non_technical    – list of plain-language bullet strings
        technical        – list of detailed/technical bullet strings
    """
    resp = scan.result_json or {}
    meta = scan.metadata_json or {}
    score = scan.manipulation_score

    non_tech = []
    tech = []

    # ── Handle API error ────────────────────────────────────
    if "error" in resp:
        non_tech.append(resp["error"])
        tech.append(resp["error"])
        return {
            "verdict": "Analysis could not be completed.",
            "non_technical": non_tech,
            "technical": tech,
        }

    # ── Parse probabilities ─────────────────────────────────
    type_data = resp.get("type", {}) if isinstance(resp.get("type"), dict) else {}
    ai_prob = type_data.get("ai_generated")
    photo_prob = type_data.get("photo")

    ai_pct = int(round(float(ai_prob) * 100)) if ai_prob is not None else None
    photo_pct = int(round(float(photo_prob) * 100)) if photo_prob is not None else None

    # ── Verdict (one-liner) ─────────────────────────────────
    if risk_level == "high":
        verdict = "This image is very likely AI-generated or heavily manipulated."
    elif risk_level == "medium":
        verdict = "This image shows some signs of AI generation or editing — results are inconclusive."
    else:
        verdict = "This image appears to be an authentic, unmanipulated photograph."

    # ── NON-TECHNICAL explanations ──────────────────────────
    if ai_pct is not None:
        if ai_pct >= 70:
            non_tech.append(
                "Our AI is highly confident this image was created by an AI model "
                "rather than captured with a real camera."
            )
            non_tech.append(
                "AI-generated images often have subtle patterns in textures, lighting, "
                "and fine details (like hair, fingers, or text) that differ from real photos."
            )
        elif ai_pct >= 30:
            non_tech.append(
                "There are some indicators that this image may have been partially "
                "generated or enhanced by AI, but the evidence is not conclusive."
            )
            non_tech.append(
                "This can happen when a real photo has been heavily filtered, "
                "retouched, or run through an AI enhancement tool."
            )
        else:
            non_tech.append(
                "The image shows strong characteristics of a genuine photograph "
                "taken with a real camera."
            )
            non_tech.append(
                "Natural noise patterns, consistent lighting, and realistic detail "
                "distribution suggest it has not been AI-generated."
            )

    # Metadata-based plain-language notes
    if not meta:
        non_tech.append(
            "No camera information (EXIF data) was found in this image. "
            "Real photos from phones and cameras usually contain this data, "
            "so its absence can be a sign of AI generation or heavy editing."
        )
    else:
        if "Make" in meta and "Model" in meta:
            non_tech.append(
                f"The image contains camera information indicating it was taken with "
                f"a {meta['Make']} {meta['Model']}, which supports authenticity."
            )
        if "Software" in meta:
            non_tech.append(
                f"The file has been processed with \"{meta['Software']}\". "
                "This means the image was edited after it was originally captured."
            )

    # ── TECHNICAL explanations ──────────────────────────────
    if ai_pct is not None:
        tech.append(
            f"AI-generation probability: {ai_pct}% — "
            "Sightengine's genai classifier analyses pixel-level artefacts, "
            "GAN/diffusion fingerprints, and frequency-domain anomalies."
        )

    if photo_pct is not None:
        tech.append(
            f"Authentic-photo probability: {photo_pct}% — "
            "measures sensor noise consistency, Bayer-pattern residuals, "
            "and JPEG compression artefact alignment."
        )

    # Metadata technical notes
    if not meta:
        tech.append(
            "EXIF metadata: absent. No Exchangeable Image File Format headers "
            "were found. This is common in AI-generated outputs and screenshots, "
            "which lack camera sensor data."
        )
    else:
        exif_entries = []
        if "Make" in meta:
            exif_entries.append(f"Make={meta['Make']}")
        if "Model" in meta:
            exif_entries.append(f"Model={meta['Model']}")
        if "DateTime" in meta or "DateTimeOriginal" in meta:
            dt = meta.get("DateTimeOriginal", meta.get("DateTime", ""))
            exif_entries.append(f"DateTime={dt}")
        if "Software" in meta:
            exif_entries.append(f"Software={meta['Software']}")
        if exif_entries:
            tech.append(f"EXIF metadata present: {', '.join(exif_entries)}.")

        if "Software" in meta:
            tech.append(
                f"Post-processing detected via Software tag \"{meta['Software']}\". "
                "This indicates the image was saved or re-encoded by editing software, "
                "which may have altered pixel data."
            )

    # Overall score note
    tech.append(
        f"Composite manipulation score: {score}/100 — "
        "weighted aggregate of AI-generation probability and metadata signals."
    )

    return {
        "verdict": verdict,
        "non_technical": non_tech,
        "technical": tech,
    }


@app.route('/api/scan-qr', methods=['POST'])
def scan_qr_route():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded."}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file."}), 400

    try:
        # 1. Read file bytes and pass to the module
        file_bytes = file.read()
        decoded_data = decode_qr_image(file_bytes)

        if not decoded_data:
            return jsonify({"status": "error", "message": "No readable QR code found."}), 400

        # 2. Check for Payment Scams FIRST
        payment_info = analyze_payment_qr(decoded_data)
        
        if payment_info["is_payment"]:
            return jsonify({
                "status": "critical", 
                "type": "payment_alert",
                "data": decoded_data,
                "details": payment_info,
                "message": payment_info["message"]
            })

        # 3. Check the data using the API client
        if decoded_data.startswith("http://") or decoded_data.startswith("https://"):
            safety_report = check_url_safety(decoded_data)
            
            if safety_report.get("is_safe"):
                return jsonify({"status": "success", "type": "url_safe", "data": decoded_data, "message": "Safe Link"})
            else:
                return jsonify({"status": "warning", "type": "url_danger", "data": decoded_data, "message": f"DANGER: {safety_report.get('reason')}"})
        else:
            return jsonify({"status": "success", "type": "text", "data": decoded_data, "message": "Plain Text"})
            
    except ValueError as ve:
        return jsonify({"status": "error", "message": str(ve)}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": "An internal server error occurred."}), 500


@app.route("/api/fact-check", methods=["POST"])
def fact_check_route():
    """Handle fact-check requests from the frontend."""
    data = request.json
    if not data or "query" not in data:
        return jsonify({"status": "error", "message": "No query provided."}), 400

    query = data["query"]
    results = get_factcheck_results(query)

    if not results:
        return jsonify({
            "status": "success",
            "message": "No specific fact-check results found for this query.",
            "results": []
        })

    return jsonify({
        "status": "success",
        "message": f"Found {len(results)} fact-check results.",
        "results": results
    })

@app.route('/api/check-website', methods=['POST'])
def check_website_route():
    data = request.json
    if not data or 'url' not in data:
        return jsonify({"status": "error", "message": "No URL provided."}), 400
        
    url = data['url'].strip()
    if not url:
        return jsonify({"status": "error", "message": "Empty URL provided."}), 400
         
    try:
        result = verify_website(url)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": f"Server error: {str(e)}"}), 500
