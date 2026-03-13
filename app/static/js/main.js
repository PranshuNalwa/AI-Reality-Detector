/**
 * AI Reality Distortion Detector — Main JavaScript
 * Handles drag-and-drop, file preview, meter animation, and share button.
 */

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initDropzone();
    initQrScanner();
    initMeter();
    initShareButton();
});

/* ── Tabs ─────────────────────────────────────────────────── */
function initTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active classes
            tabBtns.forEach(t => t.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            // Add active class to clicked tab and its content panel
            btn.classList.add("active");
            const targetId = `tab-${btn.dataset.tab}`;
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add("active");
            }
        });
    });
}


/* ── Drag-and-Drop + File Preview ───────────────────────────── */
function initDropzone() {
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("file-input");
    const preview = document.getElementById("preview");
    const previewImg = document.getElementById("preview-img");
    const previewName = document.getElementById("preview-name");
    const clearBtn = document.getElementById("preview-clear");
    const submitBtn = document.getElementById("submit-btn");

    if (!dropzone || !fileInput) return;

    // Click the drop zone to open file picker
    dropzone.addEventListener("click", (e) => {
        if (e.target.tagName !== "LABEL" && e.target.tagName !== "INPUT") {
            fileInput.click();
        }
    });

    // Prevent browser default drag behaviour
    ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) => {
        dropzone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); });
        document.body.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); });
    });

    // Visual feedback on drag
    ["dragenter", "dragover"].forEach((evt) => {
        dropzone.addEventListener(evt, () => dropzone.classList.add("dropzone--active"));
    });
    ["dragleave", "drop"].forEach((evt) => {
        dropzone.addEventListener(evt, () => dropzone.classList.remove("dropzone--active"));
    });

    // Handle drop
    dropzone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            showPreview(files[0]);
        }
    });

    // Handle file picker change
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length) {
            showPreview(fileInput.files[0]);
        }
    });

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            fileInput.value = "";
            preview.style.display = "none";
            dropzone.style.display = "";
            if (submitBtn) submitBtn.disabled = true;
        });
    }

    function showPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewName.textContent = file.name;
            preview.style.display = "flex";
            dropzone.style.display = "none";
            if (submitBtn) submitBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

/* ── QR Scanner ─────────────────────────────────────────────── */
function initQrScanner() {
    const dropzone = document.getElementById("qr-dropzone");
    const fileInput = document.getElementById("qr-file-input");
    const preview = document.getElementById("qr-preview");
    const previewImg = document.getElementById("qr-preview-img");
    const previewName = document.getElementById("qr-preview-name");
    const clearBtn = document.getElementById("qr-preview-clear");
    const submitBtn = document.getElementById("qr-submit-btn");
    const resultDiv = document.getElementById("qr-result");

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener("click", (e) => {
        if (e.target.tagName !== "LABEL" && e.target.tagName !== "INPUT") {
            fileInput.click();
        }
    });

    ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) => {
        dropzone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); });
    });

    ["dragenter", "dragover"].forEach((evt) => {
        dropzone.addEventListener(evt, () => dropzone.classList.add("dropzone--active"));
    });
    ["dragleave", "drop"].forEach((evt) => {
        dropzone.addEventListener(evt, () => dropzone.classList.remove("dropzone--active"));
    });

    dropzone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            showPreview(files[0]);
        }
    });

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length) {
            showPreview(fileInput.files[0]);
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            fileInput.value = "";
            preview.style.display = "none";
            dropzone.style.display = "";
            resultDiv.style.display = "none";
            if (submitBtn) submitBtn.disabled = true;
        });
    }

    function showPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewName.textContent = file.name;
            preview.style.display = "flex";
            dropzone.style.display = "none";
            resultDiv.style.display = "none";
            if (submitBtn) submitBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    // Handle AJAX Submission
    if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
            if (!fileInput.files.length) return;

            const formData = new FormData();
            formData.append("file", fileInput.files[0]);

            submitBtn.disabled = true;
            submitBtn.textContent = "Scanning...";
            resultDiv.style.display = "none";

            try {
                const response = await fetch("/api/scan-qr", {
                    method: "POST",
                    body: formData
                });
                const data = await response.json();

                resultDiv.style.display = "block";
                
                if (data.status === "error") {
                    resultDiv.className = "alert alert--danger";
                    resultDiv.innerHTML = `<strong>Error:</strong> ${data.message}`;
                } else if (data.status === "success") {
                    resultDiv.className = "alert alert--success";
                    resultDiv.innerHTML = `<strong>${data.message}:</strong> <a href="${data.data}" target="_blank" style="word-break: break-all;">${data.data}</a>`;
                } else if (data.status === "warning") {
                    resultDiv.className = "alert alert--warning";
                    resultDiv.innerHTML = `<strong>${data.message}:</strong> <span style="word-break: break-all;">${data.data}</span>`;
                }

            } catch (err) {
                resultDiv.style.display = "block";
                resultDiv.className = "alert alert--danger";
                resultDiv.innerHTML = `<strong>Error:</strong> Could not reach the server.`;
            }

            submitBtn.textContent = "Scan QR";
            submitBtn.disabled = false;
        });
    }
}


/* ── Circular Meter Animation ───────────────────────────────── */
function initMeter() {
    const meter = document.getElementById("meter");
    if (!meter) return;

    const score = parseInt(meter.dataset.score, 10) || 0;
    const circumference = 2 * Math.PI * 52;  // r=52 in the SVG
    const fillCircle = meter.querySelector(".meter__fill");
    const numberEl = document.getElementById("meter-number");

    // Calculate stroke-dashoffset for the target score
    const offset = circumference - (score / 100) * circumference;

    // Animate after a short delay so the CSS transition plays
    requestAnimationFrame(() => {
        setTimeout(() => {
            fillCircle.style.strokeDashoffset = offset;
        }, 100);
    });

    // Count-up the number
    animateCounter(numberEl, 0, score, 1000);
}

function animateCounter(el, start, end, duration) {
    if (!el) return;
    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (end - start) * eased);
        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

/* ── Share Button ───────────────────────────────────────────── */
function initShareButton() {
    const btn = document.getElementById("share-btn");
    if (!btn) return;

    btn.addEventListener("click", async () => {
        const url = btn.dataset.url || window.location.href;

        try {
            await navigator.clipboard.writeText(url);
            const originalHTML = btn.innerHTML;
            btn.innerHTML = 'Copied!';
            setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
        } catch {
            // Fallback for older browsers
            prompt("Copy this link:", url);
        }
    });
}
