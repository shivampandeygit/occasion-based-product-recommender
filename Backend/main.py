# main.py
# Entry point for the FastAPI backend server
# Exposes REST API endpoints for the occasion-based recommendation system

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from recommender import recommend_products

# Initialize FastAPI app
app = FastAPI(title="Occasion-Based Product Recommendation API")

# Allow frontend (React) to communicate with this backend
# CORS middleware is required when frontend and backend run on different ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request body model - defines what frontend will send
class OccasionRequest(BaseModel):
    occasion: str  # e.g. "Birthday", "Wedding", "Diwali"


@app.get("/")
def root():
    """Health check endpoint to verify server is running."""
    return {"message": "Occasion Recommender API is running!"}


@app.post("/recommend")
def get_recommendations(request: OccasionRequest):
    """
    Main recommendation endpoint.
    
    Accepts an occasion in request body and returns
    a ranked list of relevant products.
    
    Args:
        request (OccasionRequest): Contains occasion string from frontend
    
    Returns:
        dict: List of top recommended products with scores
    """
    # Call recommender logic with the provided occasion
    results = recommend_products(request.occasion)
    
    return {"products": results}