/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fff0f3",
          100: "#ffe0e7",
          200: "#ffc0cf",
          300: "#ff91a8",
          400: "#ff5075",
          500: "#ff0040",
          600: "#e6003a",
          700: "#cc0033",
          800: "#a3002a",
          900: "#800021",
        },
        dark: {
          50: "#f1f1f1",
          100: "#e0e0e0",
          200: "#aaaaaa",
          300: "#717171",
          400: "#3f3f3f",
          500: "#272727",
          600: "#212121",
          700: "#1a1a1a",
          800: "#141414",
          900: "#0f0f0f",
          950: "#080808",
        },
        purple: {
          400: "#a78bfa",
          500: "#6c63ff",
          600: "#5b52e8",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand":
          "linear-gradient(135deg, #ff0040 0%, #6c63ff 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 0, 64, 0.3)",
        "glow-purple": "0 0 20px rgba(108, 99, 255, 0.3)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
