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
          "600": "#ff8100"
        }
      }
    },
  },
  plugins: [
	  require('preline/plugin'),
  ],
};
