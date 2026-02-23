"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Brain, Zap, Shield } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 relative">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-4xl"
            >
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-neonCyan/30 text-neonCyan text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-neonGreen animate-pulse" />
                    Neural Engine v4.0 Active
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                    <span className="text-white drop-shadow-lg">NeuroPitch:</span>{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-neonGreen via-neonCyan to-blue-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
                        Captain's Dashboard
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    The ultimate AI tactical brain for modern cricket. Run million-scenario simulations, access real-time pitch heatmaps, and dominate every ball with quantum-precision prediction models.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link href="/dashboard">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(16,185,129,0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-8 py-4 bg-neonGreen text-black font-bold rounded-xl text-lg transition-all"
                        >
                            <Zap size={20} />
                            Launch Simulator
                            <ArrowRight size={20} />
                        </motion.button>
                    </Link>

                    <Link href="/livematrix">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-neonCyan text-neonCyan font-bold rounded-xl text-lg hover:bg-neonCyan/10 transition-all shadow-neon-cyan"
                        >
                            <Brain size={20} />
                            Enter Vision Matrix
                        </motion.button>
                    </Link>
                </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full"
            >
                <div className="glass-card p-6 text-left border-t-neonGreen">
                    <Brain className="text-neonGreen mb-4" size={32} />
                    <h3 className="text-xl font-bold mb-2">Quantum Processing</h3>
                    <p className="text-gray-400">Evaluate pitch wear, weather data, and biomechanics instantly.</p>
                </div>
                <div className="glass-card p-6 text-left border-t-neonCyan">
                    <Shield className="text-neonCyan mb-4" size={32} />
                    <h3 className="text-xl font-bold mb-2">Strategic Defense</h3>
                    <p className="text-gray-400">Optimize fielding positions against 50+ unique shot typologies.</p>
                </div>
                <div className="glass-card p-6 text-left border-t-blue-500">
                    <Zap className="text-blue-500 mb-4" size={32} />
                    <h3 className="text-xl font-bold mb-2">Live Execution</h3>
                    <p className="text-gray-400">Sync with edge devices for real-time dugout tactical overlays.</p>
                </div>
            </motion.div>
        </div>
    );
}
