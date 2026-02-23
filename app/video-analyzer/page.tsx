"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Database, UploadCloud, Video, Activity, Loader2, Target, Move, Crosshair } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const biomechanicsData = [
    { subject: 'Arm Speed', A: 120, fullMark: 150 },
    { subject: 'Release Rotation', A: 98, fullMark: 150 },
    { subject: 'Stride Length', A: 86, fullMark: 150 },
    { subject: 'Hip Alignment', A: 130, fullMark: 150 },
    { subject: 'Follow Through', A: 110, fullMark: 150 },
    { subject: 'Core Torque', A: 140, fullMark: 150 },
];

export default function VideoAnalyzer() {
    const [status, setStatus] = useState<"idle" | "processing" | "complete">("idle");
    const [progress, setProgress] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");

    const onDrop = useCallback((acceptedFiles: any[]) => {
        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];
        setFileName(file.name);
        setVideoUrl(URL.createObjectURL(file));
        setStatus("processing");
        setProgress(0);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'video/*': ['.mp4', '.mov', '.avi'] },
        maxSize: 500 * 1024 * 1024
    });

    useEffect(() => {
        if (status === "processing") {
            const interval = setInterval(() => {
                setProgress(prev => {
                    const next = prev + (Math.random() * 10 + 5);
                    if (next >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setStatus("complete"), 800);
                        return 100;
                    }
                    return next;
                });
            }, 300);
            return () => clearInterval(interval);
        }
    }, [status]);

    return (
        <div className="space-y-8 w-full max-w-6xl mx-auto pb-16">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-3xl font-black flex items-center gap-3 text-white tracking-tight">
                    <Video className="text-neonCyan border border-neonCyan/30 rounded p-1 shadow-[0_0_10px_rgba(6,182,212,0.5)]" size={40} />
                    Video Biomechanics Analyzer
                </h2>
                <p className="text-gray-400 mt-2">Upload raw training or match footage to generate skeletal gait analysis, release angles, and dynamic injury risk metrics.</p>
            </motion.div>

            <AnimatePresence mode="wait">
                {status === "idle" && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative overflow-hidden rounded-2xl border-2 border-dashed border-white/20 backdrop-blur-md bg-black/40 hover:bg-neonCyan/5 hover:border-neonCyan/50 transition-all cursor-pointer min-h-[400px] flex items-center justify-center group"
                        {...getRootProps()}
                    >
                        <input {...getInputProps()} />
                        <div className="absolute inset-0 bg-gradient-to-t from-neonCyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="text-center space-y-6 relative z-10 w-full max-w-md mx-auto p-6">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="w-24 h-24 mx-auto bg-black border border-neonCyan/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.3)]"
                            >
                                <UploadCloud size={48} className="text-neonCyan" />
                            </motion.div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {isDragActive ? "Drop video to initialize AI..." : "Drag & Drop Match Footage"}
                                </h3>
                                <p className="text-gray-500 text-sm">Supported formats: MP4, MOV, AVI (Max 500MB)</p>
                            </div>
                            <div className="pt-4">
                                <span className="inline-block px-8 py-4 rounded-xl bg-neonCyan/10 border border-neonCyan/40 text-neonCyan font-bold uppercase tracking-widest text-sm hover:bg-neonCyan hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all">
                                    Browse Files
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {status === "processing" && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-12 min-h-[400px] flex flex-col items-center justify-center space-y-8 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="w-32 h-32 rounded-full border-t-2 border-r-2 border-neonCyan border-b-2 border-l-2 border-b-transparent border-l-transparent"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-24 h-24 absolute top-4 left-4 rounded-full border-t-2 border-l-2 border-white/30 border-b-2 border-r-2 border-b-transparent border-r-transparent"
                            />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <Activity size={32} className="text-neonCyan animate-pulse" />
                            </div>
                        </div>

                        <div className="text-center w-full max-w-md">
                            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2 font-mono flex justify-center items-center gap-2">
                                <Loader2 className="animate-spin text-neonGreen" size={18} /> Processing '{fileName}'
                            </h3>
                            <div className="text-gray-400 text-sm h-6 overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={Math.floor(progress / 20)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="block text-neonGreen/80 font-mono"
                                    >
                                        {progress < 20 && "Extracting frames..."}
                                        {progress >= 20 && progress < 40 && "Detecting skeletal nodes..."}
                                        {progress >= 40 && progress < 60 && "Mapping joint trajectories..."}
                                        {progress >= 60 && progress < 80 && "Calculating biomechanical vectors..."}
                                        {progress >= 80 && "Synthesizing AI diagnostics..."}
                                    </motion.span>
                                </AnimatePresence>
                            </div>

                            <div className="mt-8 w-full bg-black/80 rounded-full h-2 overflow-hidden border border-white/10 p-0.5">
                                <motion.div
                                    className="h-full bg-neonCyan rounded-full relative"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${Math.min(100, progress)}%` }}
                                >
                                    <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/50 animate-pulse" />
                                </motion.div>
                            </div>
                            <div className="mt-2 text-right text-xs font-mono text-cyan-500">{Math.min(100, Math.round(progress))}%</div>
                        </div>
                    </motion.div>
                )}

                {status === "complete" && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Video Player Box */}
                        <div className="rounded-2xl border border-neonCyan/30 bg-[#0a0f16]/90 backdrop-blur-md overflow-hidden flex flex-col shadow-[0_0_30px_rgba(6,182,212,0.1)] group">
                            <div className="px-4 py-3 bg-neonCyan/10 border-b border-neonCyan/20 flex justify-between items-center">
                                <h3 className="text-white font-mono text-sm uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="text-neonGreen" size={16} /> Source Feed
                                </h3>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-neonCyan animate-pulse" />
                                </div>
                            </div>
                            <div className="relative bg-black w-full flex-grow flex items-center justify-center min-h-[350px]">
                                {videoUrl && (
                                    <video
                                        src={videoUrl}
                                        controls
                                        autoPlay
                                        loop
                                        muted
                                        className="w-full h-full object-contain pointer-events-auto z-10"
                                    />
                                )}

                                {/* Overlay simulated mesh / lines (purely visual over the video container) */}
                                <div className="absolute inset-0 pointer-events-none z-20 flex justify-center items-center opacity-40 mix-blend-screen">
                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <g className="animate-pulse">
                                            <line x1="0" y1="50" x2="100" y2="50" stroke="#00f3ff" strokeWidth="0.2" strokeDasharray="1 1" />
                                            <line x1="50" y1="0" x2="50" y2="100" stroke="#00f3ff" strokeWidth="0.2" strokeDasharray="1 1" />
                                            <circle cx="50" cy="50" r="20" fill="none" stroke="#10b981" strokeWidth="0.3" />
                                        </g>
                                    </svg>
                                </div>
                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded border border-white/10 z-30">
                                    <p className="text-[10px] text-neonGreen font-mono uppercase">Skeleton Active</p>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Dashboard Box */}
                        <div className="flex flex-col gap-6">

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#05080f] border border-white/10 rounded-xl p-5 shadow-inner relative overflow-hidden">
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-neonGreen/10 blur-2xl rounded-full" />
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Release Angle</p>
                                    <p className="text-3xl font-mono text-white flex items-baseline gap-1">42<span className="text-sm text-neonGreen">°</span></p>
                                    <p className="text-[10px] text-neonGreen mt-2 font-mono bg-neonGreen/10 inline-block px-2 py-0.5 rounded border border-neonGreen/20">Optimal: 40-45°</p>
                                </div>
                                <div className="bg-[#05080f] border border-white/10 rounded-xl p-5 shadow-inner relative overflow-hidden">
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-500/10 blur-2xl rounded-full" />
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Wrist Flex</p>
                                    <p className="text-3xl font-mono text-white flex items-baseline gap-1">12<span className="text-sm text-red-400">°</span></p>
                                    <p className="text-[10px] text-red-400 mt-2 font-mono bg-red-400/10 inline-block px-2 py-0.5 rounded border border-red-400/20">Warning: Strain Detected</p>
                                </div>
                            </div>

                            <div className="bg-[#0a0f16]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex-grow flex flex-col">
                                <h3 className="text-sm uppercase tracking-widest text-white font-bold mb-6 flex items-center gap-2">
                                    <Target className="text-neonCyan" size={16} /> Mechanics Radar
                                </h3>
                                <div className="flex-grow w-full relative min-h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={biomechanicsData}>
                                            <PolarGrid stroke="#333" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                            <Radar name="Player" dataKey="A" stroke="#00f3ff" fill="#00f3ff" fillOpacity={0.3} dot={{ stroke: '#00f3ff', strokeWidth: 2, fill: '#0a0f16' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="flex justify-end mt-2">
                                <button
                                    className="text-xs px-4 py-2 border border-white/20 text-gray-400 rounded hover:text-white hover:border-white transition-colors"
                                    onClick={() => {
                                        setStatus("idle");
                                        setVideoUrl(null);
                                        setFileName("");
                                    }}
                                >
                                    Upload New Footage
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
