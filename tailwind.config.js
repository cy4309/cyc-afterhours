const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: "#ffffff",
        ink: "#111111",
        mute: "#8a8a8a",
      },
      fontSize: {
        kicker: ["11px", { lineHeight: "1rem" }],
        caption: ["10px", { lineHeight: "1rem" }],
      },
      letterSpacing: {
        mark: "0.32em",
        kicker: "0.28em",
        meta: "0.22em",
        caption: "0.18em",
      },
      transitionDuration: {
        fast: "200ms",
        normal: "450ms",
        slow: "800ms",
        scene: "1000ms",
      },
      transitionTimingFunction: {
        micro: "cubic-bezier(0.215, 0.61, 0.355, 1)",
        layout: "cubic-bezier(0.19, 1, 0.22, 1)",
        scene: "cubic-bezier(0.83, 0, 0.17, 1)",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities, theme }) => {
      addUtilities({
        ".pb-safe-16": {
          paddingBottom: `calc(${theme("spacing.16")} + env(safe-area-inset-bottom, 0px))`,
        },
        ".pb-safe-20": {
          paddingBottom: `calc(${theme("spacing.20")} + env(safe-area-inset-bottom, 0px))`,
        },
      });
    }),
  ],
};
