import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],

  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "!./app/privacy-policy/**/*.{js,ts,jsx,tsx,mdx}",
    "./presentation-templates/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Decky Brand Colors
        "deep-navy": "hsl(var(--deep-navy))",
        "electric-orange": "hsl(var(--electric-orange))",
        "bright-teal": "hsl(var(--bright-teal))",

        // Neutrals
        "pure-white": "hsl(var(--pure-white))",
        "light-gray": "hsl(var(--light-gray))",
        "medium-gray": "hsl(var(--medium-gray))",
        "dark-gray": "hsl(var(--dark-gray))",

        // Status Colors
        "success-green": "hsl(var(--success-green))",
        "warning-yellow": "hsl(var(--warning-yellow))",
        "error-red": "hsl(var(--error-red))",
        "info-blue": "hsl(var(--info-blue))",

        // Shadcn/UI Compatible
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        inter: ["Inter", "var(--font-inter)", "sans-serif"],
        instrument_sans: ["var(--font-instrument-sans)"],
        roboto: ["var(--font-roboto)"],
      },
      fontSize: {
        // Decky Typography Scale
        hero: [
          "64px",
          { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-1px" },
        ],
        section: [
          "48px",
          { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.5px" },
        ],
        subsection: ["36px", { lineHeight: "1.3", fontWeight: "700" }],
        component: ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        label: ["20px", { lineHeight: "1.5", fontWeight: "600" }],
        "small-label": ["18px", { lineHeight: "1.5", fontWeight: "500" }],
        "body-large": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        body: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-small": ["14px", { lineHeight: "1.5", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      spacing: {
        // 8pt spacing system
        "1": "4px",
        "2": "8px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
        "12": "48px",
        "16": "64px",
        "24": "96px",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
