/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        fontFamily: {
            sans: ['Pretendard', 'Satoshi', 'sans-serif'],
        },
        extend: {
            colors: {
                primary: '#3C50E0',
                secondary: '#80CAEE',
                strokedark: '#2E3A47',
                'boxdark': '#24303F',
                'boxdark-2': '#1A222C',
                'meta-4': '#313D4A',
                'bodydark': '#AEB7C0',
                'bodydark1': '#DEE4EE',
                'bodydark2': '#8A99AF',
                success: '#219653',
                danger: '#D34053',
                warning: '#FFA70B',
            },
            fontSize: {
                'title-xxl': ['44px', '55px'],
                'title-xl': ['36px', '45px'],
                'title-xl2': ['33px', '45px'],
                'title-lg': ['28px', '35px'],
                'title-md': ['24px', '30px'],
                'title-sm2': ['22px', '28px'],
                'title-sm': ['20px', '24px'],
                'title-xsm': ['18px', '24px'],
            },
            zIndex: {
                9999: '9999',
            }
        },
    },
    plugins: [],
}
