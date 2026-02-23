"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface TacticalCardProps {
    title?: string;
    icon?: ReactNode;
    children: ReactNode;
    delay?: number;
    className?: string;
}

export default function TacticalCard({ title, icon, children, delay = 0, className = "" }: TacticalCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: "easeOut" }}
            className={`glass-card p-6 flex flex-col relative overflow-hidden group ${className}`}
        >
            {/* Subtle top glare */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {title && (
                <div className="flex items-center gap-3 mb-4">
                    {icon && (
                        <div className="p-2 rounded-lg bg-neonCyan/10 text-neonCyan shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                            {icon}
                        </div>
                    )}
                    <h3 className="text-lg font-semibold tracking-wide text-white group-hover:text-neonCyan transition-colors">{title}</h3>
                </div>
            )}

            <div className="flex-1 text-gray-300">
                {children}
            </div>
        </motion.div>
    );
}
