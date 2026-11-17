/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink:       "#1c1a17",
        parchment: "#f6f2e9",
        brass:     "#a8823c",
        rust:      "#8a4a3a",
        moss:      "#4a5d43",
        slate:     "#3d4a52",
        // tints
        "brass-50":  "#fdf7ed",
        "brass-100": "#f5e8c8",
        "rust-50":   "#fdf1ef",
        "rust-100":  "#f0cdc8",
        "moss-50":   "#eff5ef",
        "moss-100":  "#ccdacc",
        "slate-50":  "#eff2f4",
        "slate-100": "#cdd5da",
      },
      boxShadow: {
        card:       "0 1px 3px rgba(28,26,23,0.07), 0 4px 16px rgba(28,26,23,0.04)",
        "card-hover":"0 4px 12px rgba(28,26,23,0.1), 0 12px 36px rgba(28,26,23,0.07)",
        modal:      "0 20px 60px rgba(28,26,23,0.25), 0 4px 16px rgba(28,26,23,0.15)",
        glow:       "0 0 0 3px rgba(168,130,60,0.2)",
      },
      keyframes: {
        "fade-in":      { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up":     { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-down":   { from: { opacity: "0", transform: "translateY(-8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-in-right":{ from: { opacity: "0", transform: "translateX(16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "scale-in":     { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        "shimmer":      { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "pulse-dot":    { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
        "count-up":     { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "fade-in":       "fade-in 0.3s ease both",
        "slide-up":      "slide-up 0.35s ease both",
        "slide-down":    "slide-down 0.3s ease both",
        "slide-in-right":"slide-in-right 0.35s ease both",
        "scale-in":      "scale-in 0.25s ease both",
        "shimmer":       "shimmer 1.6s linear infinite",
        "pulse-dot":     "pulse-dot 1.5s ease-in-out infinite",
        "count-up":      "count-up 0.4s ease both",
      },
    },
  },
  plugins: [],
};
