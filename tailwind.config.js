/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // enable class-based dark mode
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#4f46e5",  // Indigo 600
          DEFAULT: "#4338ca", // Indigo 700
          dark: "#312e81",   // Indigo 900
        },
        background: {
          light: "#f9fafb", // very light gray
          dark: "#0f172a",  // slate-900
        },
        card: {
          light: "#ffffff",
          dark: "#1e293b",
        },
        text: {
          light: "#111827",
          dark: "#f1f5f9",
        }
      },
    },
  },
  plugins: [],
}
