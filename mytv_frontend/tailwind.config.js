/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        // Ocean Professional accents (primary/secondary)
        ocean: {
          primary: "#2563EB",
          secondary: "#F59E0B",
          success: "#F59E0B",
          error: "#EF4444",
          // Keep semantic tokens but our app is dark-first
          background: "#0b0b0b",
          surface: "#121212",
          text: "#e5e7eb",
        },
      },
      backgroundImage: {
        // Gradient overlays similar to Netflix hero fade
        "ocean-gradient": "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(2,6,23,1) 100%)",
        "hero-fade": "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)",
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(0,0,0,0.45)",
        "card-hover": "0 20px 40px -20px rgba(0,0,0,0.6)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      scale: {
        102: "1.02",
        103: "1.03",
        105: "1.05",
      },
    },
  },
  plugins: [],
}
