"use client";

import TacticalCard from "@/components/TacticalCard";
import { motion } from "framer-motion";
import { Database, UploadCloud } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function VideoAnalyzer() {
    const onDrop = useCallback((acceptedFiles: any[]) => {
        // mock processing
        console.log(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Database className="text-blue-500" /> Video Analyzer
                </h2>
                <p className="text-gray-400">Biomechanics and gait analysis from raw footage.</p>
            </motion.div>

            <TacticalCard delay={0.1} className="min-h-[400px] flex items-center justify-center border-dashed border-2 bg-black/20 hover:bg-neonCyan/5 transition-colors cursor-pointer" {...getRootProps()}>
                <input {...getInputProps()} />
                <div className="text-center space-y-4">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 mx-auto bg-neonCyan/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                    >
                        <UploadCloud size={40} className="text-neonCyan" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white">
                        {isDragActive ? "Drop video here to initialize..." : "Drag & Drop Match Footage"}
                    </h3>
                    <p className="text-gray-500">Supported formats: MP4, MOV, AVI (Max 500MB)</p>
                    <div className="pt-4">
                        <span className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-neonCyan text-white text-sm font-medium transition-colors">
                            Browse Files
                        </span>
                    </div>
                </div>
            </TacticalCard>
        </div>
    );
}
