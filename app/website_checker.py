import urllib.parse
from app.utils.api_clients import check_url_safety

def verify_website(url):
    """
    Checks the URL using the existing Google Safe Browsing API.
    Can be expanded to include other checks like Phishtank, VirusTotal, etc.
    """
    # Ensure URL is properly formatted
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url
    
    parsed_url = urllib.parse.urlparse(url)
    domain = parsed_url.netloc
    
    if not domain:
        return {"status": "error", "message": "Invalid URL provided."}
        
    safety_report = check_url_safety(url)
    
    if safety_report.get("is_safe") is None:
        return {
            "status": "warning",
            "type": "api_error",
            "data": url,
            "message": "Could not verify website.",
            "details": {
                 "domain": domain,
                 "reason": safety_report.get("reason", "API Error")
            }
        }
        
    if safety_report.get("is_safe"):
        return {
            "status": "success",
            "type": "url_safe",
            "data": url,
            "message": "Website appears safe. No malicious activity detected.",
            "details": {
                "domain": domain,
                "reason": safety_report.get("reason", "No threats found")
            }
        }
    else:
        return {
            "status": "danger",
            "type": "url_danger",
            "data": url,
            "message": "WARNING: Suspicious Website Detected",
            "details": {
                "domain": domain,
                "reason": safety_report.get("reason", "Unknown Threat")
            }
        }
