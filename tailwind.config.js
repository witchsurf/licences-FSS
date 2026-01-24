/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./index.tsx",
        "./App.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                fss: {
                    green: '#00853F',
                    yellow: '#FCD116',
                    red: '#E31B23',
                }
            }
        },
    },
    plugins: [],
}
