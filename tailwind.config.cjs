/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
	  'node_modules/preline/dist/*.js',
	  "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "brand": {
          "100": "#f8dbb9",
          "200": "#f2b873",
          "600": "#ff8100",
          "700": "#e57400"
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
	  require('preline/plugin'),
  ],
};
