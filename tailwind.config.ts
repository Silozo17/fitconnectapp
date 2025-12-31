import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Energy gradient colors
        lime: {
          DEFAULT: "hsl(var(--gradient-lime))",
          dark: "hsl(var(--gradient-lime-dark))",
        },
        purple: {
          DEFAULT: "hsl(var(--gradient-purple))",
        },
        violet: {
          DEFAULT: "hsl(var(--gradient-violet))",
        },
        magenta: {
          DEFAULT: "hsl(var(--gradient-magenta))",
        },
        cyan: {
          DEFAULT: "hsl(var(--gradient-cyan))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top, 0px)",
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        "safe-left": "env(safe-area-inset-left, 0px)",
        "safe-right": "env(safe-area-inset-right, 0px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        },
        "blob-move": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(20px, -20px) scale(1.05)" },
          "50%": { transform: "translate(-10px, 10px) scale(0.95)" },
          "75%": { transform: "translate(10px, 20px) scale(1.02)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px hsl(var(--gradient-lime) / 0.3)" },
          "50%": { boxShadow: "0 0 25px hsl(var(--gradient-lime) / 0.5)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "fade-in-down": "fade-in-down 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "slide-in-left": "slide-in-left 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "blob-move": "blob-move 10s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "slide-up": "slide-up 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
      },
      backgroundImage: {
        "hero-pattern": "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--gradient-purple) / 0.15), transparent)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      boxShadow: {
        // Premium shadow scale
        "elevation-1": "0 2px 8px hsl(0 0% 0% / 0.15)",
        "elevation-2": "0 4px 16px hsl(0 0% 0% / 0.2)",
        "elevation-3": "0 8px 32px hsl(0 0% 0% / 0.25)",
        "elevation-4": "0 16px 48px hsl(0 0% 0% / 0.3)",
        // Floating elements
        "float-sm": "0 8px 24px hsl(0 0% 0% / 0.25), 0 4px 8px hsl(0 0% 0% / 0.15)",
        "float-md": "0 16px 40px hsl(0 0% 0% / 0.3), 0 8px 16px hsl(0 0% 0% / 0.2)",
        "float-lg": "0 24px 60px hsl(0 0% 0% / 0.35), 0 12px 24px hsl(0 0% 0% / 0.25)",
        // Legacy support
        soft: "0 4px 24px hsl(0 0% 0% / 0.2), 0 1px 2px hsl(0 0% 0% / 0.1)",
        "soft-lg": "0 12px 40px hsl(0 0% 0% / 0.3), 0 4px 12px hsl(0 0% 0% / 0.15)",
        glow: "0 0 20px hsl(var(--gradient-lime) / 0.4), 0 0 40px hsl(var(--gradient-lime) / 0.2)",
        "glow-sm": "0 0 15px hsl(var(--gradient-lime) / 0.3)",
        "glow-lg": "0 0 40px hsl(var(--gradient-lime) / 0.4), 0 0 80px hsl(var(--gradient-lime) / 0.2)",
        "glow-purple": "0 0 30px hsl(var(--gradient-purple) / 0.3)",
        // Inner glow for glass effects
        "inner-glow": "inset 0 1px 0 hsl(0 0% 100% / 0.08)",
        "inner-glow-strong": "inset 0 1px 0 hsl(0 0% 100% / 0.12), inset 0 -1px 0 hsl(0 0% 0% / 0.1)",
        // Glass card shadows
        "glass-sm": "0 4px 16px hsl(0 0% 0% / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.06)",
        "glass-md": "0 8px 32px hsl(0 0% 0% / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.08)",
        "glass-lg": "0 16px 48px hsl(0 0% 0% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
        // Interactive shadows
        "interactive-hover": "0 8px 24px hsl(0 0% 0% / 0.25), 0 0 20px hsl(var(--gradient-lime) / 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
