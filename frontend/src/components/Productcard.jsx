// ProductCard.jsx
// Displays individual product details in a styled card format
// Each card has a unique accent color based on its index position

// Accent colors - cycles through for visual variety across cards
const ACCENTS = ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd"]

export default function ProductCard({ product, index }) {
  // Pick accent color based on card position
  const accent = ACCENTS[index % ACCENTS.length]

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: "20px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.25s, border-color 0.25s, box-shadow 0.25s",
        cursor: "pointer",
      }}
      // Hover effect - lift card and highlight border with accent color
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)"
        e.currentTarget.style.borderColor = accent
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4)`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      {/* Top accent line - unique color per card */}
      <div style={{ height: "3px", background: accent }} />

      {/* Product Image - fallback to emoji if no image available */}
      {product.mainImage ? (
        <img src={product.mainImage} alt={product.name}
          style={{ width: "100%", height: "200px", objectFit: "cover" }} />
      ) : (
        <div style={{
          width: "100%", height: "200px",
          background: `radial-gradient(circle at 30% 40%, ${accent}33, #0f0f13)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "3.5rem",
        }}>🎁</div>
      )}

      {/* Card Body */}
      <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Category Badge */}
        <span style={{
          fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1.5px",
          color: accent, textTransform: "uppercase", marginBottom: "0.6rem",
        }}>
          {product.category}
        </span>

        {/* Product Name */}
        <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#fff", marginBottom: "0.25rem", lineHeight: 1.3 }}>
          {product.name}
        </h3>

        {/* Brand Name */}
        <p style={{ fontSize: "0.78rem", color: "#555", marginBottom: "0.75rem" }}>
          by {product.brand}
        </p>

        {/* Short Description - clamped to 3 lines */}
        <p style={{
          fontSize: "0.85rem", color: "#888", lineHeight: "1.65", flex: 1,
          display: "-webkit-box", WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {product.shortDescription || product.description}
        </p>

        {/* Footer - Price and Relevance Score */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: "1.25rem", paddingTop: "1rem",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}>
          {/* Product Price */}
          <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "#fff" }}>
            ₹{product.price}
          </span>

          {/* Relevance Score Badge */}
          <span style={{
            fontSize: "0.75rem", fontWeight: "700",
            background: `${accent}22`,
            color: accent,
            border: `1px solid ${accent}55`,
            padding: "0.3rem 0.8rem",
            borderRadius: "999px",
          }}>
            ⭐ {product.score}/10
          </span>
        </div>
      </div>
    </div>
  )
}