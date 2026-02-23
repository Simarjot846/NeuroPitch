"use client";
import { motion } from "framer-motion";

export function Spinner({ size = 24 }: { size?: number }) {
    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ width: size, height: size }}
            className="border-2 border-neonCyan/30 border-t-neonCyan rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"
        />
    );
}
