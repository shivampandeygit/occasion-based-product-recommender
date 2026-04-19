# Occasion-Based Product Recommendation System

## Overview
A full-stack web application that recommends products from a catalog based on a user-selected occasion (e.g., Birthday, Wedding, Diwali). The system uses a hybrid recommendation approach combining LLM-based scoring and TF-IDF semantic similarity.

## Tech Stack
- **Backend:** Python, FastAPI, Uvicorn
- **Frontend:** React (Vite), Inline CSS
- **Recommendation Engine:** Groq API (LLaMA 3.3 70B) + TF-IDF fallback
- **Environment Management:** python-dotenv

## Recommendation Logic
A hybrid approach is used:

1. **LLM-based scoring (Primary):** All products are sent in batches to Groq's LLaMA 3.3 70B model. The model rates each product's relevance to the occasion on a scale of 0-10 in a single API call for efficiency.

2. **TF-IDF Cosine Similarity (Fallback):** If the Groq API quota is exceeded, TF-IDF vectorization is used to compute cosine similarity between the occasion text and each product's name, description, and short description. This ensures recommendations are always available even without API access.

Products with a relevance score of 6 or above are returned, sorted by score descending, top 10 results shown.

## Design Decisions

### Why Hybrid Approach?
A hybrid approach was chosen to balance accuracy and reliability:

- **Why Groq LLM (Primary)?**
  LLMs understand natural language context deeply. For example, "Wedding" should recommend jewelry and flowers — not just products that literally contain the word "wedding". LLM scoring captures this semantic understanding automatically without manual rules.

- **Why TF-IDF (Fallback)?**
  Free API tiers have rate limits. TF-IDF ensures the system always works even when API quota is exceeded. It computes cosine similarity between the occasion text and product descriptions — no external API needed.

- **Why Batched API Calls?**
  Instead of making 110 individual API calls (one per product), all products are sent in 2 batches. This is significantly faster and uses fewer tokens.

- **Why Score Threshold of 6?**
  Products scoring below 6 are unlikely to be relevant to the occasion. This threshold filters out noise while keeping borderline relevant products.

- **Why Occasion-Name Boosting?**
  Products whose name directly contains the occasion keyword (e.g., "Holi Dry Fruits Hampers" for Holi) are automatically boosted to a score of 9. This ensures catalog-specific products always appear at the top.

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### Backend Setup
```bash
cd Backend
pip install -r requirements.txt
```

Create a `.env` file inside `Backend/` folder:
```
GROQ_API_KEY=your_groq_api_key_here
```
Run the backend server:
```bash
uvicorn main:app --reload
```
Backend runs at: `http://127.0.0.1:8000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

## API Usage

### GET /
Health check endpoint.

**Response:**
```json
{ "message": "Occasion Recommender API is running!" }
```

### POST /recommend
**Request:**
```json
{
  "occasion": "Birthday"
}
```

**Response:**
```json
{
  "products": [
    {
      "id": "abc123",
      "name": "Dark Chocolate",
      "brand": "DRchoco",
      "category": "DRchoco",
      "description": "Rich and smooth dark chocolate...",
      "shortDescription": "Premium dark chocolate...",
      "mainImage": "https://...",
      "price": "499",
      "score": 9.0
    }
  ]
}
```

## Project Structure:

occasion-based-product-recommender/
├── Backend/
│   ├── main.py           # FastAPI server & API endpoints
│   ├── recommender.py    # Hybrid recommendation logic
│   ├── products.json     # Product catalog data
│   └── requirements.txt  # Python dependencies
└── frontend/
└── src/
├── App.jsx                    # Main UI component
└── components/
└── ProductCard.jsx        # Product card component

## AI Tools Used
- **Groq API (LLaMA 3.3 70B)** — Primary LLM-based product scoring
- **scikit-learn TF-IDF** — Fallback semantic similarity scoring
- **GitHub Copilot** — Used for coding and autocompletion during development