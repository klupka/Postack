/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            animation: {
                windUpSpin: "windUpSpin 4s ease-in-out infinite",
                slideDown: "slideDown 0.15s ease-out",
                fadeInBounce: "fadeInBounce 0.25s ease-in",
                likeBounce: "likeBounce 0.5s ease-out",
                inputLabel: "inputLabel 0.15s forwards",
                inputLabelReverse: "inputLabelReverse 0.15s forwards",
                moveLeft: "moveLeft 0.25s forwards",
                moveRight: "moveRight 0.25s forwards",
                stayLeft: "stayLeft 0s forwards",
                stayRight: "stayRight 0s forwards",
                globalNotification:
                    "globalNotification 0.5s ease-in-out forwards",
                globalNotificationFade:
                    "globalNotificationFade 6s ease-out forwards",
                globalNotificationTimer:
                    "globalNotificationTimer 5.5s linear forwards",
                rise: "rise 0.25s ease-in-out forwards",
                mobileNav: "mobileNav 0.35s forwards",
            },
            keyframes: {
                mobileNav: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(0%)" },
                },
                rise: {
                    "0%": { transform: "translateY(0%)" },
                    "100%": { transform: "translateY(-5%)" },
                },
                globalNotificationFade: {
                    "0%": { opacity: "100%" },
                    "95%": { opacity: "100%" },
                    "100%": { opacity: "0%" },
                },

                globalNotificationTimer: {
                    "0%": { transform: "translateX(0%)" },
                    "100%": { transform: "translateX(-100%)" },
                },
                globalNotification: {
                    "0%": { transform: "translateX(-200%)" },
                    "100%": { transform: "translateX(0%)" },
                },
                stayRight: {
                    "0%": { transform: "translateX(0%)" },
                    "100%": { transform: "translateX(0%)" },
                },
                stayLeft: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(-100%)" },
                },
                moveRight: {
                    "0%": { transform: "translateX(0%)" },
                    "100%": { transform: "translateX(-100%)" },
                },
                moveLeft: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(0%)" },
                },
                inputLabel: {
                    "0%": { transform: "translateY(50%)", scale: "125%" },
                    "100%": { transform: "translateY(0%)", scale: "100%" },
                },
                inputLabelReverse: {
                    "0%": { transform: "translateY(0%)", scale: "100%" },

                    "100%": {
                        transform: "translateY(50%) translateX(8%)",
                        scale: "125%",
                        opacity: "0%",
                    },
                },
                windUpSpin: {
                    "0%": { transform: "rotate(0deg)" },
                    "25%": { transform: "rotate(-80deg)" },
                    "45%": { transform: "rotate(755deg)" },
                    "50%": { transform: "rotate(700deg)" },
                    "60%": { transform: "rotate(725deg)" },
                    "65%": { transform: "rotate(715deg)" },
                    "100%": { transform: "rotate(720deg)" },
                },
                likeBounce: {
                    "0%": {
                        scale: "100%",
                        transform: "translateY(0%)",
                    },
                    "1%": {
                        scale: "150%",
                    },
                    "25%": {
                        scale: "100%",
                    },
                },
                slideDown: {
                    "0%": {
                        transform: "translateY(-0.5%)",
                        opacity: "0%",
                    },
                    "100%": {
                        transform: "translateY(0)",
                        opacity: "100%",
                    },
                },
                fadeInBounce: {
                    "0%": {
                        scale: "25%",
                        opacity: "0%",
                    },
                    "50%": {
                        scale: "100%",
                        opacity: "100%",
                    },
                    "60%": {
                        scale: "130%",
                    },
                    "70%": {
                        scale: "90%",
                    },
                    "100%": {
                        scale: "100%",
                    },
                },
            },
            colors: {
                text: "var(--text)",
                offText: "var(--offText)",
                background: "var(--background)",
                navBackground: "var(--navBackground)",
                cardBg: "var(--cardBg)",
                cardBgHover: "var(--cardBgHover)",
                cardButtonBg: "var(--cardButtonBg)",
                border: "var(--border)",
                primary: "var(--primary)",
                secondary: "var(--secondary)",
                accent: "var(--accent)",
                placeholderText: "var(--placeholderText)",
            },
            dropShadow: {
                custom: "0px 0px 5px #22272B25",
                custom2: "0px 0px 5px var(--primary)",
            },
        },
    },
    plugins: [],
};
