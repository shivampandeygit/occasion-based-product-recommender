# recommender.py
# Handles recommendation logic using a Hybrid approach:
# Primary: Groq LLM-based scoring
# Fallback: TF-IDF semantic similarity when API quota is exceeded

import os
import json
from groq import Groq
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client with API key
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def load_products():
    """
    Loads product catalog from products.json.
    Returns a list of product dictionaries.
    """
    with open(os.path.join(os.path.dirname(__file__), "products.json"), "r", encoding="utf-8") as f:
        return json.load(f)


def tfidf_score(products, occasion):
    """
    Fallback scoring using TF-IDF cosine similarity.
    Compares occasion text against product descriptions.

    Args:
        products: list of product dictionaries
        occasion: occasion string

    Returns:
        list of scores (0-10)
    """
    # Build corpus from product text
    corpus = []
    for p in products:
        text = (
            p.get("name", "") + " " +
            p.get("description", "") + " " +
            p.get("shortDescription", "")
        )
        corpus.append(text)

    # Add occasion as query document
    corpus.append(occasion)

    # Compute TF-IDF matrix
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Compute cosine similarity between occasion and each product
    occasion_vector = tfidf_matrix[-1]
    product_vectors = tfidf_matrix[:-1]
    similarities = cosine_similarity(occasion_vector, product_vectors)[0]

    # Scale similarity scores to 0-10
    return [round(float(s) * 10, 2) for s in similarities]


def score_batch(batch, occasion):
    """
    Score a batch of products using Groq API.
    Falls back to TF-IDF if API quota is exceeded.

    Args:
        batch: list of products
        occasion: occasion string

    Returns:
        list of scores
    """
    product_list = ""
    for i, product in enumerate(batch):
        name = product.get('name', '')
        desc = (product.get('shortDescription', '') or product.get('description', ''))[:60]
        product_list += f"{i}. {name} — {desc}\n"

    # Prompt instructs Groq to rate each product's relevance for the occasion
    prompt = f"""You are a gift recommendation expert for Indian occasions.
Occasion: {occasion}

Rate each product's relevance for this occasion from 0 to 10.
Be strict - only give high scores to products truly relevant to {occasion}.
For Holi: rate colors, gulal, dry fruits hampers, sweets, festive gifts high.
For Diwali: rate dry fruits, sweets, diyas, candles, hampers high.
For Birthday: rate chocolates, flowers, perfumes, jewelry, watches high.
For Wedding: rate jewelry, flowers, perfumes, hampers, sarees high.
For Valentine's Day: rate roses, chocolates, perfumes, jewelry high.
For Anniversary: rate jewelry, watches, perfumes, flowers high.
If product is clearly irrelevant to the occasion, give 0.
Reply ONLY with a valid JSON array of numbers, one per product, in the same order.
Example format: [7, 2, 8, 0, 5]

Products:
{product_list}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2000
        )
        text = response.choices[0].message.content.strip()
        # Clean markdown if present in response
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        # Fallback to TF-IDF scoring if API quota exceeded
        print(f"Groq error: {e}, using TF-IDF fallback...")
        return tfidf_score(batch, occasion)


def recommend_products(occasion: str):
    """
    Scores all products against the given occasion using hybrid approach.
    Primary: Groq LLM scoring
    Fallback: TF-IDF cosine similarity

    Args:
        occasion (str): e.g. "Birthday", "Wedding", "Diwali"

    Returns:
        list: Top 10 relevant products sorted by relevance score
    """
    # Load all products
    products = load_products()

    # Filter out products with poor/irrelevant descriptions
    products = [p for p in products if len(p.get("description", "") + p.get("shortDescription", "")) > 30]

    # Split into 2 batches for efficient API usage
    mid = len(products) // 2
    batch1 = products[:mid]
    batch2 = products[mid:]

    # Score both batches
    scores1 = score_batch(batch1, occasion)
    scores2 = score_batch(batch2, occasion)

    # Combine all scores
    all_scores = scores1 + scores2
    
    # Boost products whose name contains the occasion keyword
    occasion_keyword = occasion.lower()
    for i, product in enumerate(products):
        name = product.get("name", "").lower()
        if occasion_keyword in name:
            if i < len(all_scores):
                all_scores[i] = max(all_scores[i], 9.0)

    # Combine products with their scores
    scored = []
    for i, product in enumerate(products):
        score = float(all_scores[i]) if i < len(all_scores) else 0.0

        # Only include products with score 6 or above
        if score >= 6:
            scored.append({
                "id": product.get("id"),
                "name": product.get("name", ""),
                "brand": product.get("brand", ""),
                "category": product.get("vendor_category_desc") or product.get("brand") or "General",
                "description": product.get("description", ""),
                "shortDescription": product.get("shortDescription", ""),
                "mainImage": product.get("mainImage", ""),
                "price": product.get("price", ""),
                "score": score
            })

    # Sort by score descending and return top 10
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:10]