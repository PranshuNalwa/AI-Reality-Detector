import os
import requests
from flask import current_app

def analyze_text_with_sapling(text):
    """
    Sends text to the Sapling AI API to get an AI-generation probability score.
    Returns a dictionary with the score and verdict.
    """
    api_key = current_app.config.get("SAPLING_API_KEY") or os.environ.get("SAPLING_API_KEY")
    
    if not api_key:
        # Mock response if no key is provided just for testing
        return {
            "score": 0.85,
            "verdict": "LIKELY AI GENERATED",
            "message": "System Test Mode (No API Key)"
        }

    url = "https://api.sapling.ai/api/v1/aidetect"
    payload = {
        "key": api_key,
        "text": text
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            score = data.get("score", 0)  # 0.0 to 1.0 probability
            
            # Convert to 0-100 percentage
            percent_score = round(score * 100)
            
            # Determine verdict based on score thresholds
            if percent_score >= 80:
                verdict = "VERY LIKELY AI GENERATED"
            elif percent_score >= 60:
                verdict = "LIKELY AI GENERATED"
            elif percent_score >= 40:
                verdict = "MIXED / INCONCLUSIVE"
            else:
                verdict = "HUMAN WRITTEN"
                
            return {
                "score": percent_score,
                "verdict": verdict,
                "message": "Analysis Complete"
            }
        else:
            current_app.logger.error(f"Sapling API Error: {response.text}")
            return {
                "error": True, 
                "message": "Error communicating with AI detection service."
            }

    except Exception as e:
        current_app.logger.error(f"Sapling API Exception: {str(e)}")
        return {
            "error": True,
            "message": f"Server error during analysis: {str(e)}"
        }
