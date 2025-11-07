/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "nile-blue": "#0D2C56",
        sandstone: "#D9C8A0",
        basalt: "#2C2C2C",
        "electric-mint": "#2CF5C4",
        "off-white": "#FAFAF8",
        // OKLCH-based semantic tokens
        brand: {
          1: "var(--brand-1)",
          2: "var(--brand-2)",
          3: "var(--brand-3)",
        },
        surface: {
          bg: "var(--bg)",
          DEFAULT: "var(--surface)",
          card: "var(--card)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        arabic: ["Cairo", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "oklch-lg": "var(--r-lg)",
        "oklch-xl": "var(--r-xl)",
        "oklch-2xl": "var(--r-2xl)",
      },
      spacing: {
        "oklch-1": "var(--space-1)",
        "oklch-2": "var(--space-2)",
        "oklch-3": "var(--space-3)",
        "oklch-4": "var(--space-4)",
        "oklch-6": "var(--space-6)",
        "oklch-8": "var(--space-8)",
      },
      fontSize: {
        hero: ["var(--fs-hero)", { lineHeight: "1.1" }],
        h1: ["var(--fs-h1)", { lineHeight: "1.2" }],
        h2: ["var(--fs-h2)", { lineHeight: "1.3" }],
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
      },
    },
  },
  plugins: [
    require("tailwindcss-logical"),
  ],
};
