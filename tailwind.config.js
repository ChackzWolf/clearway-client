/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#3B6FF2", hover: "#2F5BD9" },
        surface: { dark: "#0B0D12", darkCard: "#14161C", darkBorder: "#23262F", light: "#F7F8FB", lightBorder: "#E7E9EF" },
      },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [],
};
