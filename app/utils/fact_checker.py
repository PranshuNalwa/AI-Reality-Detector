import os
import requests
from flask import current_app

def get_factcheck_results(query):
    """
    Search for fact-check claims using the Google Fact Check Tools API.
    """
    api_key = os.environ.get("FACT_CHECK_API_KEY") or os.environ.get("GOOGLE_SAFE_BROWSING_API")
    
    if not api_key or api_key == "FACT_CHECK_API_KEY":
        # Cannot connect without an API key
        return []

    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    params = {
        "query": query,
        "key": api_key
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code != 200:
            return []

        data = response.json()
        if "claims" not in data:
            return []

        results = []
        for claim in data["claims"]:
            claim_text = claim.get("text", "")
            for review in claim.get("claimReview", []):
                results.append({
                    "claim": claim_text,
                    "publisher": review["publisher"]["name"],
                    "rating": review.get("textualRating", "Unknown"),
                    "url": review.get("url", "")
                })

        return results

    except Exception as e:
        current_app.logger.error(f"Fact Check API Error: {str(e)}")
        return []
