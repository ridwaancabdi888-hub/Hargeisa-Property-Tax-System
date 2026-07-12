/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a1728",
          900: "#0e1f36",
          800: "#132a49",
          700: "#1c3a63",
          600: "#26497c",
          500: "#33599a",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16, 24, 40, 0.06), 0 1px 3px 0 rgba(16, 24, 40, 0.08)",
        premium: "0 20px 40px -12px rgba(19, 42, 73, 0.12), 0 4px 6px -2px rgba(19, 42, 73, 0.05)",
      },
    },
  },
  plugins: [],
}
