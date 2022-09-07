/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const radix = require('tailwindcss-radix');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [radix],
};
