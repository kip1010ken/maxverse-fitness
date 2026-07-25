/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#151512",
        bone: "#F1EEE6",
        flame: "#D62828",
        moss: "#4A5D23",
        steel: "#8A8578",
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        body: ["Work Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
