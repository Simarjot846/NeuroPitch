import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                neonGreen: "#10b981", // cricket green
                neonCyan: "#06b6d4",
                blackBg: "#0a0a0a",
                darkMat: "#111111",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
            boxShadow: {
                "neon-cyan": "0 0 25px rgba(6,182,212,0.35)",
                "neon-green": "0 0 25px rgba(16,185,129,0.35)",
            },
            animation: {
                "spin-slow": "spin 3s linear infinite",
                "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                pulseGlow: {
                    "0%, 100%": { opacity: "1", transform: "scale(1)" },
                    "50%": { opacity: "0.8", transform: "scale(1.02)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
