/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    600: '#0369a1',
                    700: '#075985',
                },
            },
        },
    },
    plugins: [],
}
