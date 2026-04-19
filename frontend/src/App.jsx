// App.jsx
// Main UI - clean professional dark theme
// Handles occasion selection, API calls, and product grid rendering

import { useState } from "react"
import ProductCard from "./components/ProductCard"

// List of supported occasions with emoji labels
const occasions = [
  { value: "Birthday", label: "🎂 Birthday" },
  { value: "Wedding", label: "💍 Wedding" },
  { value: "Diwali", label: "🪔 Diwali" },
  { value: "Holi", label: "🎨 Holi" },
  { value: "Valentine's Day", label: "❤️ Valentine's Day" },
  { value: "Anniversary", label: "💑 Anniversary" },
  { value: "Baby Shower", label: "👶 Baby Shower" },
  { value: "Christmas", label: "🎄 Christmas" },
  { value: "Office Party", label: "🎉 Office Party" },
  { value: "Engagement", label: "💎 Engagement" },
  { value: "Housewarming", label: "🏠 Housewarming" },
]

export default function App() {
  // Store selected occasion from dropdown
  const [occasion, setOccasion] = useState("")

  // Store recommended products returned from API
  const [products, setProducts] = useState([])

  // Loading state while API call is in progress
  const [loading, setLoading] = useState(false)

  // Track if search has been triggered at least once
  const [searched, setSearched] = useState(false)

  // Handle search - calls backend recommendation API
  const handleSearch = async (sel = occasion) => {
    if (!sel.trim()) return
    setLoading(true)
    setSearched(true)
    setProducts([])

    try {
      const res = await fetch("http://127.0.0.1:8000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion: sel }),
      })
      const data = await res.json()
      setProducts(data.products)
    } catch (e) {
      console.error("Error fetching recommendations:", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Global styles - dark theme with purple accents */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        .page { min-height: 100vh; background: #0a0a0f; font-family: 'Segoe UI', sans-serif; color: #fff; }
        
        /* Hero section - gradient background with glow effect */
        .hero {
          background: linear-gradient(160deg, #0a0a0f 0%, #0f0f1a 60%, #0a0a0f 100%);
          padding: 60px 24px 50px;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.12), transparent);
          pointer-events: none;
        }

        /* Badge - pill-shaped label above title */
        .badge {
          display: inline-block;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.3);
          color: #a78bfa;
          font-size: 0.72rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 999px;
          margin-bottom: 20px;
        }

        /* Hero title */
        .hero h1 {
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 12px;
          color: #fff;
        }
        .hero h1 span {
          background: linear-gradient(90deg, #a78bfa, #f472b6, #fb923c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero p {
          color: #6b7280;
          font-size: 1rem;
          margin-bottom: 36px;
        }

        /* Search row - dropdown + button */
        .search-row {
          display: flex;
          gap: 10px;
          max-width: 520px;
          margin: 0 auto;
        }
        .search-row select {
          flex: 1;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 0.95rem;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
        }
        .search-row select option {
          background: #1a1a2e;
          color: #fff;
        }

        /* Search button - purple gradient */
        .search-btn {
          padding: 14px 28px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: #fff;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s;
        }
        .search-btn:hover { opacity: 0.85; }

        /* Results section */
        .results { padding: 40px 24px; max-width: 1200px; margin: 0 auto; }

        /* Loading spinner animation */
        .spinner {
          width: 40px; height: 40px;
          border: 3px solid rgba(255,255,255,0.08);
          border-top: 3px solid #a78bfa;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 60px auto 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Results header - shows count and occasion name */
        .results-header {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .results-header span { color: #a78bfa; font-weight: 600; }

        /* Product grid - responsive auto-fill columns */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        /* Empty state - shown when no products found */
        .empty {
          text-align: center;
          padding: 80px 0;
          color: #4b5563;
          font-size: 0.95rem;
        }
      `}</style>

      <div className="page">

        {/* Hero Section - title, subtitle, search */}
        <div className="hero">
          <div className="badge">🎁 Gift Discovery</div>
          <h1>Find Gifts for Every <span>Occasion</span></h1>
          <p>Select an occasion below and get AI-powered product recommendations.</p>

          {/* Search Row - occasion dropdown + search button */}
          <div className="search-row">
            <select
              value={occasion}
              onChange={e => setOccasion(e.target.value)}
            >
              <option value="" disabled>Select an occasion…</option>
              {occasions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button className="search-btn" onClick={() => handleSearch()}>
              Search →
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="results">

          {/* Loading State - spinner while API call is in progress */}
          {loading && (
            <div style={{ textAlign: "center" }}>
              <div className="spinner" />
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Finding recommendations…</p>
            </div>
          )}

          {/* Empty State - shown after search with no results */}
          {!loading && searched && products.length === 0 && (
            <div className="empty">
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🔍</div>
              No products found for "<strong style={{ color: "#fff" }}>{occasion}</strong>"
            </div>
          )}

          {/* Product Grid - renders when products are available */}
          {!loading && products.length > 0 && (
            <>
              <p className="results-header">
                Showing <span>{products.length} results</span> for <span>{occasion}</span>
              </p>
              <div className="grid">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}