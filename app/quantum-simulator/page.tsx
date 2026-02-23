"use client";

import TacticalCard from "@/components/TacticalCard";
import { motion } from "framer-motion";
import { Cpu, Zap } from "lucide-react";

export default function QuantumSimulator() {
    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Cpu className="text-neonGreen" /> Quantum Simulator
                </h2>
                <p className="text-gray-400">Advanced multi-variable Monte Carlo simulation engine.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TacticalCard title="Engine Metrics" icon={<Zap size={20} />} className="h-[300px]">
                    <div className="flex flex-col h-full justify-center space-y-8">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Processing Cores</span>
                            <span className="font-mono text-neonCyan drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">12,048</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Sims/Second</span>
                            <span className="font-mono text-neonGreen drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">1,450,000</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Model Accuracy</span>
                            <span className="font-mono text-white">99.98%</span>
                        </div>
                    </div>
                </TacticalCard>

                <TacticalCard title="Terminal Configuration" delay={0.2} className="h-[300px]">
                    <div className="bg-[#0a0a0a] rounded p-4 font-mono text-xs text-neonGreen h-full overflow-y-auto border border-white/5 shadow-inner">
                        <p>{">"} INIT quantum_state...</p>
                        <p>{">"} Loading pitch topography v4.2...</p>
                        <p>{">"} OK.</p>
                        <p className="text-neonCyan animate-pulse mt-2">{">"} READY for parameter injection_</p>
                    </div>
                </TacticalCard>
            </div>
        </div>
    );
}
