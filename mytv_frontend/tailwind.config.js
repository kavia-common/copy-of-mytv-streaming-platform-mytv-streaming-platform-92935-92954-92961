/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          primary: "#2563EB",
          secondary: "#F59E0B",
          success: "#F59E0B",
          error: "#EF4444",
          background: "#f9fafb",
          surface: "#ffffff",
          text: "#111827",
        },
      },
      backgroundImage: {
        "ocean-gradient": "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(249,250,251,1) 100%)",
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
}
