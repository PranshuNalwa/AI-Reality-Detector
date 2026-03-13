"""
Sightengine API integration for AI/deepfake image analysis.
"""

import os
import requests
from flask import current_app


def analyze_with_sightengine(image_path: str) -> tuple:
    """
    Send an image to the Sightengine API for AI-generation and
    deepfake detection.

    Returns
    -------
    (manipulation_score: int, full_response: dict)
        manipulation_score is an integer 0-100 representing overall
        likelihood the image is manipulated / AI-generated.
        full_response is the raw JSON dictionary from the API.

    If the API call fails or credentials are missing the function
    returns a score of -1 and an error dict.
    """
    api_user = current_app.config.get("SIGHTENGINE_API_USER", "")
    api_secret = current_app.config.get("SIGHTENGINE_API_SECRET", "")

    # Guard: missing credentials
    if not api_user or not api_secret or api_user == "your-user-id":
        return -1, {
            "error": "Sightengine API credentials are not configured. "
                     "Please add them to your .env file."
        }

    url = "https://api.sightengine.com/1.0/check.json"

    try:
        with open(image_path, "rb") as img_file:
            response = requests.post(
                url,
                files={"media": img_file},
                data={
                    "models": "genai",
                    "api_user": api_user,
                    "api_secret": api_secret,
                },
                timeout=30,
            )

        result = response.json()

        if result.get("status") == "failure":
            error_msg = result.get("error", {}).get("message", "Unknown API error")
            return -1, {"error": error_msg, "raw": result}

        # ---- Calculate manipulation score ----
        # The genai model returns result.type.ai_generated (0-1 probability)
        ai_generated = 0.0
        type_data = result.get("type", {})
        if isinstance(type_data, dict):
            ai_generated = float(type_data.get("ai_generated", 0))

        # Convert to 0–100 integer scale
        manipulation_score = int(round(ai_generated * 100))

        return manipulation_score, result

    except requests.RequestException as exc:
        return -1, {"error": f"API request failed: {str(exc)}"}
    except (ValueError, KeyError) as exc:
        return -1, {"error": f"Failed to parse API response: {str(exc)}"}
