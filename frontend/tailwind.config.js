/** @type {import('tailwindcss').Config} */
// Tailwind CSS Configuration File
// Defines which files Tailwind should scan for class names
// and any theme customizations or plugins

export default {
  // Content paths - Tailwind will scan these files to generate only used CSS classes
  // This keeps the final CSS bundle size minimal (tree-shaking)
  content: [
    "./index.html",                  // Root HTML file
    "./src/**/*.{js,ts,jsx,tsx}",   // All JS/JSX/TS/TSX files inside src folder
  ],

  // Theme customization - extend default Tailwind design tokens
  // Add custom colors, fonts, spacing, etc. here if needed
  theme: {
    extend: {},
  },

  // Plugins - add any Tailwind plugin extensions here
  plugins: [],
}
