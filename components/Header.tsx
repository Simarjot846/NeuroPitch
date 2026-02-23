"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-20 border-b border-neonCyan/20 bg-black/30 backdrop-blur-lg flex items-center justify-between px-6 lg:px-10 z-10 w-full">
            <div className="flex items-center gap-4">
                {/* Connection status dot */}
                <div className="flex items-center gap-2">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neonGreen opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-neonGreen shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    </div>
                    <span className="text-xs text-neonGreen font-semibold tracking-wider uppercase">Sync Active</span>
                </div>
            </div>

            <div className="flex items-center gap-4 hidden sm:flex">
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors w-10 h-10 flex items-center justify-center"
                >
                    {mounted ? (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />) : null}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors relative"
                >
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                </motion.button>

                <div className="h-8 w-[1px] bg-white/10 mx-2" />

                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-white group-hover:text-neonCyan transition-colors">Captain</p>
                        <p className="text-xs text-gray-400">Tactical Brain</p>
                    </div>
                    <UserCircle size={32} className="text-gray-400 group-hover:text-neonCyan transition-colors" />
                </div>
            </div>
        </header>
    );
}
