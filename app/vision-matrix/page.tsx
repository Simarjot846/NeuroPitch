"use client";

import TacticalCard from "@/components/TacticalCard";
import { Eye, Map, Navigation, LocateFixed } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useState } from "react";

const ThreeHeatmap = dynamic(() => import("@/components/ThreeHeatmap"), { ssr: false });

const suggestions = [
    { id: 1, label: "Move Deep Square Leg wider", risk: "Low", conf: "94%" },
    { id: 2, label: "Bring Long On inside circle", risk: "High", conf: "78%" },
    { id: 3, label: "Deploy Fly Slip", risk: "Med", conf: "82%" },
];

export default function VisionMatrix() {
    const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null);

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Eye className="text-neonCyan" /> Vision Matrix
                </h2>
                <p className="text-gray-400">Spatial analysis and field placement optimization.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TacticalCard title="Fielding Heatmap" icon={<Map size={20} />} className="h-[450px]">
                    <div className="w-full h-full p-2 relative">
                        <ThreeHeatmap activeSuggestion={activeSuggestion} />
                    </div>
                </TacticalCard>

                <div className="space-y-6">
                    <TacticalCard title="Suggested Alterations" icon={<LocateFixed size={20} />}>
                        <ul className="space-y-4">
                            {suggestions.map((item) => (
                                <li
                                    key={item.id}
                                    onClick={() => setActiveSuggestion(activeSuggestion === item.id ? null : item.id)}
                                    className={`flex justify-between items-center p-3 rounded-lg border transition-colors cursor-pointer group ${activeSuggestion === item.id
                                            ? "border-neonCyan bg-neonCyan/10"
                                            : "bg-white/5 border-white/5 hover:border-neonCyan hover:bg-neonCyan/5"
                                        }`}
                                >
                                    <span className={`transition-colors ${activeSuggestion === item.id ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                                        {item.label}
                                    </span>
                                    <div className="flex gap-3 text-xs">
                                        <span className={`px-2 py-1 rounded bg-black/50 ${item.risk === 'High' ? 'text-red-400' : item.risk === 'Med' ? 'text-yellow-400' : 'text-neonGreen'}`}>
                                            {item.risk} Risk
                                        </span>
                                        <span className="px-2 py-1 rounded bg-neonCyan/20 text-neonCyan">{item.conf} Conf</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </TacticalCard>

                    <TacticalCard title="Ball Trajectory Prediction" icon={<Navigation size={20} />}>
                        <div className="h-24 w-full flex items-center justify-between px-6 bg-black/40 rounded-lg border border-white/10 overflow-hidden relative">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "1000%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]"
                            />
                            <div className="text-center w-full z-10 text-gray-500 font-mono text-sm">
                                Awaiting live feed...
                            </div>
                        </div>
                    </TacticalCard>
                </div>
            </div>
        </div>
    );
}
