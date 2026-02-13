/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2874F0",
        "primary-dark": "#1C52C5",
        "primary-light": "#E8F4FF",
        secondary: "#FF6B6B",
        accent: "#FFA500",
        dark: "#1a1a1a",
        light: "#f5f5f5",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 4px 24px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
}
