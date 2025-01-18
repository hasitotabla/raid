/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{svelte,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#effef4",
          100: "#dafee6",
          200: "#b7fbcf",
          300: "#7af5a6",
          400: "#41e77d",
          500: "#18cf5a",
          600: "#0dac47",
          700: "#0e873a",
          800: "#116a33",
          900: "#10572c",
          950: "#023116",
        },
      },
    },
  },
  plugins: [],
};
