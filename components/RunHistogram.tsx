"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface RunHistogramProps {
    data: Array<{ over: string; runs: number }>;
}

export function RunHistogram({ data }: RunHistogramProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-6"
        >
            <h3 className="text-lg font-semibold mb-4 text-white">Run Distribution</h3>
            
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4} />
                        </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="over" 
                        stroke="#666" 
                        tick={{ fill: "#999" }}
                        axisLine={{ stroke: "#333" }}
                    />
                    <YAxis 
                        stroke="#666" 
                        tick={{ fill: "#999" }}
                        axisLine={{ stroke: "#333" }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.9)",
                            border: "1px solid rgba(6, 182, 212, 0.4)",
                            borderRadius: "8px",
                            color: "#fff",
                        }}
                        cursor={{ fill: "rgba(6, 182, 212, 0.1)" }}
                    />
                    <Bar dataKey="runs" radius={[8, 8, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill="url(#barGradient)"
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
