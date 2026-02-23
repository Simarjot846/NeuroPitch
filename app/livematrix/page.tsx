"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Radio, RefreshCcw, Activity, Shield, Crosshair } from "lucide-react";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/Spinner";
import { PieChart, Pie, Cell } from 'recharts';

interface TeamSelection {
    matchId: string;
    team: string;
    role: "Batting" | "Fielding";
}

interface Match {
    id: string;
    name: string;
    status: string;
    score: string | null;
    rr: string | null;
    time: string | null;
    venue: string;
}

const WinProbabilityGauge = ({ probability }: { probability: number }) => {
    const data = [
        { name: 'Win', value: probability },
        { name: 'Loss', value: 100 - probability }
    ];
    return (
        <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-20 h-20 flex items-center justify-center drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        >
            <PieChart width={80} height={80}>
                <Pie
                    data={data}
                    cx={36}
                    cy={36}
                    innerRadius={28}
                    outerRadius={36}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                >
                    <Cell fill="#10b981" />
                    <Cell fill="#111111" />
                </Pie>
            </PieChart>
            <div className="absolute top-1/2 left-[45%] transform -translate-x-1/2 -translate-y-1/2 text-[12px] font-bold text-neonGreen">
                {probability}%
            </div>
        </motion.div>
    );
};

export default function LiveMatrix() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState(0);
    const [selections, setSelections] = useState<Record<string, TeamSelection>>({});
    const [results, setResults] = useState<Record<string, any>>({});
    const [simulating, setSimulating] = useState<Record<string, boolean>>({});

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/today-matches");
            if (res.ok) {
                const data = await res.json();
                setMatches(data);
                setLastSync(0);
            } else {
                setMatches([]);
            }
        } catch (error) {
            console.warn("Failed to fetch match data - is the Python backend running?");
            setMatches([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMatches();
        const syncInterval = setInterval(() => setLastSync((prev) => prev + 1), 1000);
        const pollInterval = setInterval(() => fetchMatches(), 25000); // Poll Endpoint every 25s
        return () => {
            clearInterval(syncInterval);
            clearInterval(pollInterval);
        };
    }, []);

    const handleSimulation = async (match: Match) => {
        const selection = selections[match.id];
        if (!selection) return;

        setSimulating((prev) => ({ ...prev, [match.id]: true }));
        try {
            const res = await fetch("http://localhost:8000/live-prediction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ match_id: match.id, selected_team: selection.team, role: selection.role }),
            });
            if (res.ok) {
                const data = await res.json();
                setResults((prev) => ({ ...prev, [match.id]: data }));
            }
        } catch (error) {
            console.warn("Failed live prediction - is the Python backend running?");
        }
        setSimulating((prev) => ({ ...prev, [match.id]: false }));
    };

    return (
        <div className="space-y-8 relative z-10 w-full min-h-screen pb-16">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <Radio className="text-neonCyan animate-pulse" /> Live Match Coach Analyzer
                    </h2>
                    <p className="text-gray-400 mt-2">Real-time match discovery. Monitor win probabilities and access tactical adjustments.</p>
                </motion.div>

                <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-full border border-white/5 shadow-inner">
                    <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-neonGreen'}`} />
                        Last sync: {lastSync} sec ago
                    </span>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={fetchMatches}
                        disabled={loading}
                        className="p-2 text-neonCyan hover:text-white transition-colors disabled:opacity-50"
                    >
                        <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                    </motion.button>
                </div>
            </div>

            {loading && Object.keys(matches).length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                    <Spinner size={40} />
                    <p className="text-neonCyan animate-pulse tracking-widest uppercase text-sm font-bold">Connecting to Live Matrix API...</p>
                </div>
            ) : matches.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center p-16 text-center border rounded-2xl border-white/10 backdrop-blur-md bg-black/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                >
                    <Activity size={48} className="text-gray-600 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-300 mb-2">No live/upcoming matches detected today</h3>
                    <p className="text-gray-500 max-w-md">No live or scheduled matches were found on the endpoints. Try simulator or check back later.</p>
                </motion.div>
            ) : (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.15 }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
                >
                    <AnimatePresence>
                        {matches.map((match) => {
                            const isLive = match.status === "live";
                            const simData = results[match.id];
                            const teams = match.name.split("vs").map(t => t.trim());
                            const isSimulating = simulating[match.id];

                            return (
                                <motion.div
                                    key={match.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 50, scale: 0.95 },
                                        visible: { opacity: 1, y: 0, scale: 1 }
                                    }}
                                    layout
                                    className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-[#0a0f16]/80 border border-white/10 hover:border-neonCyan transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group flex flex-col min-h-[400px]"
                                >
                                    {/* Neon top accent */}
                                    <div className={`absolute top-0 left-0 w-full h-1 ${isLive ? 'bg-gradient-to-r from-red-500 to-red-900' : 'bg-gradient-to-r from-cyan-500 to-blue-900'}`} />

                                    <div className="p-6 flex-grow flex flex-col">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="bg-black/40 px-3 py-1.5 rounded-md border border-white/5 text-xs text-gray-400 font-mono flex items-center gap-2">
                                                {match.venue}
                                            </div>
                                            {isLive ? (
                                                <div className="flex items-center gap-2 bg-red-950/40 px-3 py-1 rounded-full border border-red-500/30">
                                                    <span className="relative flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                    </span>
                                                    <span className="text-[11px] uppercase font-bold text-red-400 tracking-wider">Live</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30">
                                                    <span className="text-[11px] uppercase font-bold text-cyan-400 tracking-wider">Upcoming</span>
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-2xl lg:text-3xl font-black mb-4 text-white uppercase tracking-tight leading-tight flex items-center flex-wrap gap-2">
                                            {teams.map((team, idx) => {
                                                const flagObj: Record<string, string> = { "India": "🇮🇳", "South Africa": "🇿🇦", "England": "🇬🇧", "Sri Lanka": "🇱🇰", "Australia": "🇦🇺", "Pakistan": "🇵🇰", "New Zealand": "🇳🇿", "Bangladesh": "🇧🇩", "West Indies": "🌴", "Afghanistan": "🇦🇫" };
                                                const flag = flagObj[team] || "🏏";
                                                return (
                                                    <span key={idx} className="flex items-center gap-2">
                                                        <span className="text-xl">{flag}</span>
                                                        {team}
                                                        {idx === 0 && <span className="text-gray-600 mx-2 text-xl font-normal lowercase italic">vs</span>}
                                                    </span>
                                                )
                                            })}
                                        </h3>

                                        <div className="flex justify-between items-end mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
                                            <div>
                                                <p className={`text-3xl font-bold font-mono tracking-tight ${isLive ? 'text-neonCyan drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'text-gray-300'}`}>
                                                    {isLive ? match.score || "Live Play" : match.time || "Scheduled"}
                                                </p>
                                                {isLive && match.rr && (
                                                    <div className="mt-2 flex gap-3">
                                                        <p className="text-sm bg-neonGreen/10 text-neonGreen px-2 py-0.5 rounded border border-neonGreen/20 font-mono">CRR {match.rr}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {isLive && (
                                                <div className="transform translate-y-2">
                                                    <WinProbabilityGauge probability={simData?.current_win_probability || 50} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            <AnimatePresence mode="wait">
                                                {!simData ? (
                                                    <motion.div
                                                        key="select"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="space-y-4"
                                                    >
                                                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider flex items-center gap-2">
                                                            <Activity size={14} className="text-neonCyan" /> Select Your Side
                                                        </label>
                                                        <select
                                                            onChange={(e) => {
                                                                const [team, role] = e.target.value.split("|");
                                                                setSelections({ ...selections, [match.id]: { matchId: match.id, team, role: role as any } });
                                                            }}
                                                            className="w-full bg-[#05080f] border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-neonCyan transition-all shadow-inner appearance-none cursor-pointer"
                                                            value={selections[match.id] ? `${selections[match.id].team}|${selections[match.id].role}` : ""}
                                                        >
                                                            <option value="" disabled>Select a team's coaching terminal...</option>
                                                            {teams.map((t, idx) => (
                                                                <optgroup key={idx} label={t}>
                                                                    <option value={`${t}|Batting`}>{t} - Batting Target/Chase</option>
                                                                    <option value={`${t}|Fielding`}>{t} - Fielding & Bowling</option>
                                                                </optgroup>
                                                            ))}
                                                        </select>

                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handleSimulation(match)}
                                                            disabled={!selections[match.id] || isSimulating}
                                                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-xs flex justify-center items-center gap-3 ${selections[match.id] ? "bg-neonCyan/10 text-neonCyan border border-neonCyan/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:bg-neonCyan hover:text-black hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]" : "bg-white/5 text-gray-600 border border-transparent cursor-not-allowed"}`}
                                                        >
                                                            {isSimulating ? <Spinner size={16} /> : "Initialize Tactical Run"}
                                                        </motion.button>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="results"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="bg-[#05080f] border border-neonCyan/20 p-5 rounded-xl shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] relative overflow-hidden"
                                                    >
                                                        {/* Animated background pulse */}
                                                        <motion.div
                                                            className="absolute -top-10 -right-10 w-32 h-32 bg-neonCyan/10 blur-3xl rounded-full"
                                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                                            transition={{ duration: 4, repeat: Infinity }}
                                                        />

                                                        <div className="flex justify-between items-center mb-4 relative z-10">
                                                            <p className="text-sm text-neonCyan font-bold flex items-center gap-2 uppercase tracking-wide">
                                                                {simData.role === 'Batting' ? <Crosshair size={16} /> : <Shield size={16} />}
                                                                {simData.team} {simData.role}
                                                            </p>
                                                            <button
                                                                onClick={() => {
                                                                    const ns = { ...results };
                                                                    delete ns[match.id];
                                                                    setResults(ns);
                                                                }}
                                                                className="text-xs text-gray-500 hover:text-white transition-colors"
                                                            >
                                                                Change Session
                                                            </button>
                                                        </div>

                                                        <ul className="text-sm space-y-3 text-gray-300 relative z-10">
                                                            {simData.suggested_tactics.map((tactic: string, idx: number) => {
                                                                // Highlight impact numbers (e.g. +8%)
                                                                const parts = tactic.split('→');
                                                                return (
                                                                    <motion.li
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: idx * 0.2 }}
                                                                        key={idx}
                                                                        className="flex flex-col gap-1 bg-white/5 p-3 rounded-lg border border-white/5"
                                                                    >
                                                                        <span className="leading-relaxed text-xs">{parts[0]}</span>
                                                                        {parts[1] && (
                                                                            <span className="text-neonGreen font-bold font-mono text-xs flex items-center gap-2">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-neonGreen animate-pulse" />
                                                                                {parts[1].trim()}
                                                                            </span>
                                                                        )}
                                                                    </motion.li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
