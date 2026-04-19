/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        glow: "0 0 0 1px rgba(59, 130, 246, 0.18), 0 10px 30px rgba(59, 130, 246, 0.12)",
      },
      backgroundImage: {
        "app-gradient":
          "radial-gradient(circle at top left, rgba(59,130,246,0.14), transparent 35%), radial-gradient(circle at top right, rgba(14,165,233,0.12), transparent 30%), linear-gradient(to bottom, rgba(248,250,252,1), rgba(241,245,249,1))",
      },
      colors: {
        ink: {
          950: "#0f172a",
          900: "#111827",
        },
      },
    },
  },
  plugins: [],
};
