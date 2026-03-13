import requests
from flask import current_app

def get_factcheck_results(query):
    """
    Search for fact-check claims using the Google Fact Check Tools API.
    """
    api_key = current_app.config.get("FACT_CHECK_API_KEY")
    if not api_key:
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
