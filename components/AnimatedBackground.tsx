"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedBackground() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0a0a0a]">
            {/* Dynamic gradient background */}
            <motion.div
                animate={{
                    background: [
                        "radial-gradient(circle at 0% 0%, #0a0a0a 0%, #06b6d41a 50%, #0a0a0a 100%)",
                        "radial-gradient(circle at 100% 100%, #0a0a0a 0%, #10b9811a 50%, #0a0a0a 100%)",
                        "radial-gradient(circle at 0% 0%, #0a0a0a 0%, #06b6d41a 50%, #0a0a0a 100%)",
                    ],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-60"
            />

            {/* Floating particles */}
            {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
                        x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                        scale: Math.random() * 0.5 + 0.5,
                        opacity: Math.random() * 0.3 + 0.1,
                    }}
                    animate={{
                        y: [null, Math.random() * -500],
                        x: [null, (Math.random() - 0.5) * 200 + (typeof window !== "undefined" ? window.innerWidth / 2 : 500)],
                        opacity: [null, 0],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className={`absolute h-1 w-1 rounded-full ${i % 2 === 0 ? 'bg-neonCyan' : 'bg-neonGreen'}`}
                />
            ))}
        </div>
    );
}
