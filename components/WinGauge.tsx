"use client";

import { ResponsiveContainer, RadialBarChart, RadialBar, Tooltip } from "recharts";
import { motion } from "framer-motion";

export default function WinGauge({
    team1Prob,
    team2Prob,
    team1Name,
    team2Name,
}: {
    team1Prob: number;
    team2Prob: number;
    team1Name: string;
    team2Name: string;
}) {
    const data = [
        {
            name: team2Name,
            uv: team2Prob,
            fill: "#ef4444", // red-500
        },
        {
            name: team1Name,
            uv: team1Prob,
            fill: "#10b981", // neon green
        },
    ];

    return (
        <div className="relative h-64 w-full flex items-center justify-center -mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    cx="50%"
                    cy="70%"
                    innerRadius="70%"
                    outerRadius="110%"
                    barSize={16}
                    data={data}
                    startAngle={180}
                    endAngle={0}
                >
                    <RadialBar
                        background={{ fill: '#ffffff10' }}
                        dataKey="uv"
                        cornerRadius={10}
                        isAnimationActive={true}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#06b6d4', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                </RadialBarChart>
            </ResponsiveContainer>

            <motion.div
                animate={{ scale: [1.02, 1.05, 1.02] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-6 flex flex-col items-center justify-center text-center"
            >
                <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-neonGreen to-neonCyan drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
                    {team1Prob}%
                </span>
                <span className="text-xs uppercase tracking-widest text-gray-400 mt-1">{team1Name} Win Prob</span>
            </motion.div>
        </div>
    );
}
