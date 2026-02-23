"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TacticalCard from "@/components/TacticalCard";
import WinGauge from "@/components/WinGauge";
import { Spinner } from "@/components/Spinner";
import { Settings2, BarChart3, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("../../components/HeatmapPlot"), { ssr: false, loading: () => <Spinner /> });

export default function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(false);

    const mockData = [
        { range: "0-10", runs: 4 },
        { range: "11-20", runs: 15 },
        { range: "21-30", runs: 30 },
        { range: "31-40", runs: 25 },
        { range: "41-50", runs: 12 },
    ];

    const handleSimulate = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setResults(true);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-3xl font-bold tracking-tight">Tactical Simulator</h2>
                <p className="text-gray-400">Configure parameters for quantum matchmaking.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Container */}
                <div className="lg:col-span-1 space-y-6">
                    <TacticalCard title="Input Parameters" icon={<Settings2 size={20} />} delay={0.1}>
                        <form onSubmit={handleSimulate} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Batting Team</label>
                                <select className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neonCyan transition-all focus:ring-1 focus:ring-neonCyan">
                                    <option>India</option>
                                    <option>Australia</option>
                                    <option>England</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Target Score</label>
                                <input
                                    type="number"
                                    defaultValue={180}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neonCyan transition-all focus:ring-1 focus:ring-neonCyan"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full mt-4 flex justify-center items-center py-4 rounded-xl bg-neonCyan/10 text-neonCyan font-bold border border-neonCyan/30 hover:bg-neonCyan hover:text-black transition-colors shadow-neon-cyan"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? <Spinner size={20} /> : "Initialize Simulation"}
                            </motion.button>
                        </form>
                    </TacticalCard>
                </div>

                {/* Results Container */}
                <div className="lg:col-span-2 space-y-6">
                    {results ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <TacticalCard title="Win Probability" icon={<Target size={20} />} delay={0.2} className="h-[350px]">
                                <WinGauge team1Prob={68} team2Prob={32} team1Name="IND" team2Name="AUS" />
                            </TacticalCard>

                            <TacticalCard title="Run Projection" icon={<BarChart3 size={20} />} delay={0.3} className="h-[350px]">
                                <div className="w-full h-full pb-8">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mockData}>
                                            <XAxis dataKey="range" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                                            <RechartsTooltip cursor={{ fill: '#ffffff0a' }} contentStyle={{ backgroundColor: '#0a0a0add', borderColor: '#06b6d4', borderRadius: '8px' }} />
                                            <Bar dataKey="runs" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </TacticalCard>

                            <TacticalCard title="Pitch Heatmap (Plotly)" className="md:col-span-2 h-[400px]" delay={0.4}>
                                <div className="w-full h-full rounded-lg overflow-hidden bg-white/5 relative flex justify-center items-center pt-8">
                                    <Plot
                                        data={[
                                            {
                                                z: [[1, 20, 30], [20, 1, 60], [30, 60, 1]],
                                                type: 'heatmap',
                                                colorscale: 'Viridis',
                                                hoverinfo: 'z'
                                            }
                                        ]}
                                        layout={{
                                            width: undefined,
                                            height: 300,
                                            autosize: true,
                                            margin: { t: 0, l: 0, r: 0, b: 0 },
                                            paper_bgcolor: 'transparent',
                                            plot_bgcolor: 'transparent',
                                            xaxis: { visible: false },
                                            yaxis: { visible: false }
                                        }}
                                        config={{ responsive: true, displayModeBar: false }}
                                        style={{ width: "100%", height: "100%" }}
                                    />
                                </div>
                            </TacticalCard>
                        </motion.div>
                    ) : (
                        <div className="h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-12 text-center text-gray-500 glass-card">
                            Configure parameters and run the simulator to view quantum predictions.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
