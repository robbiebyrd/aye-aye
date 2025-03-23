import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'burnham': {
          50: '#F2F4F4',
          100: '#E6EAE9',
          200: '#C0CAC8',
          300: '#9BAAA7',
          400: '#4F6B64',
          500: '#042B22',
          600: '#04271F',
          700: '#021A14',
          800: '#02130F',
          900: '#010D0A',
        },

        'sherwood-green': {
          50: '#F2F5F4',
          100: '#E6ECEA',
          200: '#C0CFCA',
          300: '#9BB1AA',
          400: '#4F776B',
          500: '#043D2B',
          600: '#043727',
          700: '#02251A',
          800: '#021B13',
          900: '#01120D',
        },

        'cod-gray': {
          50: '#F2F3F3',
          100: '#E6E7E7',
          200: '#C0C2C2',
          300: '#9B9D9D',
          400: '#4F5454',
          500: '#040B0A',
          600: '#040A09',
          700: '#020706',
          800: '#020505',
          900: '#010303',
        },

        'kaitoke-green': {
          50: '#F2F6F4',
          100: '#E6EDEA',
          200: '#C0D3CA',
          300: '#9BB8AB',
          400: '#4F826B',
          500: '#044D2C',
          600: '#044528',
          700: '#022E1A',
          800: '#022314',
          900: '#01170D',
        },


      },
    },
  },
  plugins: [],
} satisfies Config;
