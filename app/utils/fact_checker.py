import os
import requests
import urllib.parse
from bs4 import BeautifulSoup
from flask import current_app

from app.utils.news_scraper import scrape_news_articles

def calculate_credibility_score(fact_checks, related_news):
    """
    Calculates a credibility score (0-100) and verdict based on results.
    """
    score = 50  # Start at neutral
    false_found = False
    true_found = False
    
    # 1. Fact Check Influence
    for fc in fact_checks:
        rating = fc['rating'].lower()
        if any(w in rating for w in ['false', 'fake', 'misleading', 'wrong', 'untrue']):
            score = min(score, 20)  # Heavily penalize
            false_found = True
        elif any(w in rating for w in ['true', 'correct', 'accurate']):
            score = max(score, 85)
            true_found = True
            
    # 2. News Prevalence Influence (adds credibility if no falseness found)
    if not false_found:
        unique_sources = len(set(n['source'] for n in related_news))
        score += (unique_sources * 15)
    
    # Clamp score
    score = max(0, min(100, score))
    
    # 3. Determine Verdict
    if false_found:
        verdict = "FALSE / MISLEADING"
    elif true_found or (score >= 75 and len(related_news) >= 2):
        verdict = "AUTHENTIC"
    elif score >= 55:
        verdict = "LIKELY AUTHENTIC"
    elif score >= 40:
        verdict = "INCONCLUSIVE"
    else:
        verdict = "SUSPICIOUS"
        
    return score, verdict

def get_factcheck_results(query):
    """
    Search for fact-check claims and related news articles.
    """


    api_key = current_app.config.get("FACT_CHECK_API_KEY")
    search_query = query.strip()
    
    # Extract metadata for URL search
    if search_query.startswith(('http://', 'https://')):
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            page_resp = requests.get(search_query, headers=headers, timeout=5)
            if page_resp.status_code == 200:
                soup = BeautifulSoup(page_resp.text, 'html.parser')
                title = soup.title.string if soup.title else None
                if title:
                    search_query = title.strip()
        except Exception:
            pass


    # 1. Get Google Fact Check Results
    fact_checks = []
    if api_key:
        try:
            url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
            params = {"query": search_query, "key": api_key}
            resp = requests.get(url, params=params, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                for claim in data.get("claims", []):
                    claim_text = claim.get("text", "")
                    for review in claim.get("claimReview", []):
                        fact_checks.append({
                            "claim": claim_text,
                            "publisher": review["publisher"]["name"],
                            "rating": review.get("textualRating", "Unknown"),
                            "url": review.get("url", "")
                        })
        except Exception as e:
            current_app.logger.error(f"Fact Check API Error: {str(e)}")

    # 2. Get Real-Time Scraped News
    scraped_news = scrape_news_articles(search_query)

    # 3. Calculate Score
    score, verdict = calculate_credibility_score(fact_checks, scraped_news)

    return {
        "fact_checks": fact_checks,
        "related_news": scraped_news,
        "query_used": search_query,
        "credibility_score": score,
        "verdict": verdict
    }
