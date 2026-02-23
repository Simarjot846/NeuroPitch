"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Spinner } from "./Spinner";

const Plot = dynamic(() => import("react-plotly.js"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[400px]">
            <Spinner />
        </div>
    ),
});

interface FieldHeatmapProps {
    data: Array<{ x: number; y: number; value: number }>;
}

export function FieldHeatmap({ data }: FieldHeatmapProps) {
    const x = data.map((d) => d.x);
    const y = data.map((d) => d.y);
    const z = data.map((d) => d.value);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card p-6"
        >
            <h3 className="text-lg font-semibold mb-4 text-white">Field Heatmap</h3>
            
            <Plot
                data={[
                    {
                        x,
                        y,
                        z,
                        type: "scatter",
                        mode: "markers",
                        marker: {
                            size: 12,
                            color: z,
                            colorscale: [
                                [0, "#06b6d4"],
                                [0.5, "#10b981"],
                                [1, "#fbbf24"],
                            ],
                            showscale: true,
                            colorbar: {
                                thickness: 15,
                                len: 0.7,
                                bgcolor: "rgba(0,0,0,0.5)",
                                bordercolor: "rgba(6, 182, 212, 0.4)",
                                borderwidth: 1,
                                tickfont: { color: "#999" },
                            },
                        },
                    },
                ]}
                layout={{
                    paper_bgcolor: "transparent",
                    plot_bgcolor: "transparent",
                    xaxis: {
                        showgrid: false,
                        zeroline: false,
                        showticklabels: false,
                        range: [-100, 100],
                    },
                    yaxis: {
                        showgrid: false,
                        zeroline: false,
                        showticklabels: false,
                        range: [-100, 100],
                    },
                    margin: { l: 20, r: 20, t: 20, b: 20 },
                    hovermode: "closest",
                }}
                config={{ displayModeBar: false }}
                className="w-full"
                style={{ height: "400px" }}
            />
        </motion.div>
    );
}
