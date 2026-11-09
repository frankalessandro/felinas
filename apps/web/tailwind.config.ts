import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        felina: {
          rosa: "hsl(var(--felina-rosa))",
          negro: "hsl(var(--felina-negro))",
          dorado: "hsl(var(--felina-dorado))",
          morado: "hsl(var(--felina-morado))",
          "rosa-light": "hsl(var(--felina-rosa-light))",
          "rosa-glow": "hsl(var(--felina-rosa-glow))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Solo quedan los loops infinitos ambientales: corren en el compositor via CSS.
      // Las animaciones de entrada (fade-up/fade-in) ahora las maneja GSAP.
      // Los bucles ambientales (float / glow / bounce / pulse) los maneja GSAP vía
      // data-ambient: ver initAmbient() en src/scripts/animations.ts. Se pausan fuera del viewport.
    },
  },
  plugins: [],
} satisfies Config;
