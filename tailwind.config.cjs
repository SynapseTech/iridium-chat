/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
	  'node_modules/preline/dist/*.js',
	  "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
	  require('preline/plugin'),
  ],
};
