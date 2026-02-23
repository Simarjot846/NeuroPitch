"use client";

import { Leaf, Menu, Moon, Sun, X, Activity, BarChart2, Shield, Play, Brain, Database } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { href: "/", label: "Home", icon: Activity },
    { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
    { href: "/livematrix", label: "Live Matrix", icon: Play },
    { href: "/vision-matrix", label: "Vision Matrix", icon: Shield },
    { href: "/quantum-simulator", label: "Quantum Sim", icon: Brain },
    { href: "/video-analyzer", label: "Video Analysis", icon: Database },
];

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg bg-black/60 border border-neonCyan/40 text-neonCyan hover:bg-neonCyan/20 transition-colors"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: isOpen ? 0 : -280 }}
                className="fixed md:static inset-y-0 left-0 w-64 z-40 h-full border-r border-neonCyan/20 bg-black/60 backdrop-blur-xl md:translate-x-0"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ transform: "translateX(0)" }}
            >
                <div className="flex items-center gap-3 p-6 mb-4">
                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-neonGreen to-neonCyan flex items-center justify-center shadow-neon-green">
                        <Leaf className="text-black" size={20} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neonGreen to-neonCyan">
                        NeuroPitch
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                                <motion.div
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? "bg-neonCyan/10 text-neonCyan border border-neonCyan/30 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)]"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Icon size={18} className={isActive ? "text-neonCyan drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" : ""} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>
            </motion.aside>

            {/* Keep it open in Desktop View via CSS */}
            <style jsx global>{`
        @media (min-width: 768px) {
          aside { transform: none !important; }
        }
      `}</style>
        </>
    );
}
