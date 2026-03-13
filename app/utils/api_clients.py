import requests
import os

# You would ideally load this from config.py or .env
GOOGLE_API_KEY = os.environ.get("GOOGLE_SAFE_BROWSING_API", "YOUR_API_KEY_HERE")

def check_url_safety(url):
    """Checks a URL against the Google Safe Browsing API."""
    if GOOGLE_API_KEY == "YOUR_API_KEY_HERE":
        return {"is_safe": True, "reason": "No API key configured. Assumed safe for testing."}

    api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_API_KEY}"
    payload = {
        "client": {"clientId": "unified-detector", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }
    
    try:
        response = requests.post(api_url, json=payload)
        result = response.json()
        
        if "matches" in result:
            return {"is_safe": False, "reason": result["matches"][0]["threatType"]}
        return {"is_safe": True, "reason": "No threats found"}
    except Exception as e:
        return {"is_safe": None, "reason": f"API Error: {str(e)}"}