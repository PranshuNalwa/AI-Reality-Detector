import requests
from bs4 import BeautifulSoup
import urllib.parse
import re

def scrape_news_articles(query):
    """
    Search for articles on top news domains. 
    Returns a list of articles with title, url, and source.
    """
    if not query:
        return []

    articles = []
    # Using a search aggregator approach - trying to find news from NDTV and TOI
    sources = [
        {
            "name": "NDTV",
            "search_url": "https://www.ndtv.com/search?q=",
            "article_selector": ".src_lst-li",
            "title_selector": ".src_lst-ttl a",
            "link_selector": ".src_lst-ttl a"
        },
        {
            "name": "Times of India",
            "search_url": "https://timesofindia.indiatimes.com/topic/",
            "article_selector": ".uwU81", # TOI topic page selector
            "title_selector": "span",
            "link_selector": "a"
        }
    ]

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    for source in sources:
        try:
            full_url = f"{source['search_url']}{urllib.parse.quote(query)}"
            resp = requests.get(full_url, headers=headers, timeout=7)
            
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'html.parser')
                items = soup.select(source['article_selector'])[:3] # Get top 3
                
                for item in items:
                    title_el = item.select_one(source['title_selector'])
                    link_el = item.select_one(source['link_selector'])
                    
                    if title_el and link_el:
                        title = title_el.get_text().strip()
                        link = link_el.get('href')
                        
                        if not link.startswith('http'):
                           base_url = urllib.parse.urlparse(source['search_url']).netloc
                           link = f"https://{base_url}{link}"

                        # Stricter relevance check: 
                        # 1. Clean query and title
                        q_words = set(re.findall(r'\w+', query.lower()))
                        t_words = set(re.findall(r'\w+', title.lower()))
                        
                        # 2. Match percentage (at least 50% of query keywords in title)
                        matches = q_words.intersection(t_words)
                        relevance = len(matches) / len(q_words) if q_words else 0
                        
                        if relevance >= 0.5:
                            articles.append({
                                "title": title,
                                "url": link,
                                "source": source['name'],
                                "relevance": round(relevance * 100, 2)
                            })
        except Exception as e:
            continue

    return articles
