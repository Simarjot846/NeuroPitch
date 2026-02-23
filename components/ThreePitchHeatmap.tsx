"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line, Sphere, Plane, Cylinder } from "@react-three/drei";
import * as THREE from "three";

// Active fielders (11 cyan spheres)
const activeFielders = [
    { id: 'f1', position: [0, 0.5, 9.5], role: "Wicketkeeper" },
    { id: 'f2', position: [0, 0.5, -9.5], role: "Bowler" },
    { id: 'f3', position: [3, 0.5, 3], role: "Point" },
    { id: 'f4', position: [-3, 0.5, 5], role: "Square Leg" },
    { id: 'f5', position: [7, 0.5, -4], role: "Mid Off" },
    { id: 'f6', position: [-6, 0.5, -5], role: "Mid On" },
    { id: 'f7', position: [9, 0.5, 9], role: "Third Man" },
    { id: 'f8', position: [-10, 0.5, 8], role: "Fine Leg" },
    { id: 'f9', position: [12, 0.5, -2], role: "Cover" },
    { id: 'f10', position: [-14, 0.5, 2], role: "Deep Mid Wicket" },
    { id: 'f11', position: [2, 0.5, 8], role: "Slip" },
];

const suggestions = [
    { id: 1, position: [-16, 0.5, 4], risk: "Low", text: "Move Deep Square Leg wider\nLow Risk 94% Conf" },
    { id: 2, position: [-8, 0.5, -12], risk: "High", text: "Bring Long On inside circle\nHigh Risk 78% Conf" },
    { id: 3, position: [4, 0.5, 9], risk: "Med", text: "Deploy Fly Slip\nMed Risk 82% Conf" },
];

function Marker({ position, color, text, isSuggested = false, isActive = false }: any) {
    const [hovered, setHovered] = useState(false);

    const scale = isActive ? 1.5 : 1;
    const glowIntensity = isActive || hovered ? 3 : 1.5;

    return (
        <group position={position} scale={[scale, scale, scale]}>
            <Sphere
                args={[0.3, 32, 32]}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
            >
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glowIntensity} />
            </Sphere>

            {/* Extended Light glow aura */}
            <Sphere args={[0.7, 32, 32]}>
                <meshBasicMaterial color={color} transparent opacity={isActive ? 0.6 : 0.25} blending={THREE.AdditiveBlending} />
            </Sphere>

            {(hovered || isActive) && (
                <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
                    <div className="bg-black/90 backdrop-blur-md border border-cyan-400/60 text-white text-xs p-3 rounded-lg whitespace-pre-wrap shadow-[0_0_20px_rgba(6,182,212,0.8)] pointer-events-none min-w-[160px] text-center font-bold tracking-wide">
                        {text}
                    </div>
                </Html>
            )}

            {isSuggested && isActive && (
                <Html position={[0, 3, 0]} center>
                    <div className="animate-bounce drop-shadow-[0_0_10px_rgba(16,185,129,1)]">
                        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-neonGreen" />
                    </div>
                </Html>
            )}
        </group>
    );
}

function BallTrajectory() {
    const lineRef = useRef<any>(null);
    const particleRef = useRef<any>(null);
    const [dashOffset, setDashOffset] = useState(0);

    const points = useMemo(() => [
        new THREE.Vector3(0, 0.5, -8.5),
        new THREE.Vector3(0, 2.5, -2),
        new THREE.Vector3(0, 0.1, 5),
        new THREE.Vector3(0, 0.8, 8.5),
    ], []);

    const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
    const curvePoints = useMemo(() => curve.getPoints(100), [curve]);

    useFrame((state, delta) => {
        if (lineRef.current) {
            setDashOffset((prev) => prev - delta * 5);
        }
        if (particleRef.current) {
            const time = (state.clock.elapsedTime * 0.5) % 1;
            const pos = curve.getPointAt(time);
            particleRef.current.position.copy(pos);
        }
    });

    return (
        <group>
            <Line
                ref={lineRef}
                points={curvePoints}
                color="#00f3ff"
                lineWidth={4}
                dashed
                dashSize={0.6}
                dashOffset={dashOffset}
                gapSize={0.3}
            />
            <Sphere ref={particleRef} args={[0.15, 16, 16]}>
                <meshBasicMaterial color="#ffffff" />
            </Sphere>
            {/* Glow on the moving ball */}
            <Sphere args={[0.4, 16, 16]} position={particleRef.current?.position}>
                <meshBasicMaterial color="#00f3ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
            </Sphere>
        </group>
    );
}

function PitchSurface() {
    // Highly detailed heatmap texture mimicking a radar scanner
    const heatmapTexture = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 1024;
        const context = canvas.getContext("2d");
        if (context) {
            const centerX = 512;
            const centerY = 512;

            // Base dark transparent
            context.fillStyle = "rgba(0,0,0,0)";
            context.fillRect(0, 0, 1024, 1024);

            // Radar rings
            for (let i = 1; i <= 5; i++) {
                context.beginPath();
                context.arc(centerX, centerY, i * 90, 0, Math.PI * 2);
                context.strokeStyle = `rgba(6, 182, 212, ${0.1 + (i * 0.05)})`;
                context.lineWidth = 2;
                context.stroke();
            }

            // Radar angle lines
            for (let i = 0; i < 12; i++) {
                context.beginPath();
                context.moveTo(centerX, centerY);
                context.lineTo(centerX + Math.cos((i * Math.PI) / 6) * 450, centerY + Math.sin((i * Math.PI) / 6) * 450);
                context.strokeStyle = "rgba(6, 182, 212, 0.15)";
                context.lineWidth = 1;
                context.stroke();
            }

            // Heatmap gradient
            const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, 480);
            gradient.addColorStop(0, "rgba(220, 38, 38, 0.85)"); // Inner Red (High Action)
            gradient.addColorStop(0.3, "rgba(234, 179, 8, 0.6)"); // Mid Yellow
            gradient.addColorStop(0.6, "rgba(16, 185, 129, 0.3)"); // Outer Green (Safe)
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

            context.globalCompositeOperation = "source-over";
            context.beginPath();
            context.arc(centerX, centerY, 480, 0, Math.PI * 2);
            context.fillStyle = gradient;
            context.fill();
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        return texture;
    }, []);

    // Outer Stadium Stands Texture (Simple dark crowd representation)
    const crowdTexture = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, 512, 128);
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.2)" : `rgba(6,182,212,${Math.random() * 0.3})`;
            ctx.fillRect(Math.random() * 512, Math.random() * 128, 2, 2);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group>
            {/* Lush Green Field Map */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <circleGeometry args={[26, 128]} />
                <meshStandardMaterial color="#0a2a12" roughness={0.9} />
            </mesh>

            {/* Mowed grass pattern rings */}
            {[24, 20, 16, 12, 8, 4].map((radius, i) => (
                <mesh key={`ring-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
                    <ringGeometry args={[radius - 2, radius, 128]} />
                    <meshStandardMaterial color="#0d3618" roughness={1} />
                </mesh>
            ))}

            {/* 30-yard Inner Circle Line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <ringGeometry args={[13.8, 14, 128]} />
                <meshBasicMaterial color="rgba(255, 255, 255, 0.6)" side={THREE.DoubleSide} transparent opacity={0.6} />
            </mesh>

            {/* Outer Boundary Rope */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <torusGeometry args={[25.8, 0.1, 16, 100]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>

            {/* Sub-Boundary Advertising Boards */}
            <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[26, 26, 0.8, 64, 1, true]} />
                <meshStandardMaterial color="#06b6d4" side={THREE.DoubleSide} transparent opacity={0.15} emissive="#06b6d4" emissiveIntensity={0.5} />
            </mesh>

            {/* Stadium Stands Background Ring */}
            <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[35, 30, 8, 64, 1, true]} />
                <meshBasicMaterial map={crowdTexture} side={THREE.BackSide} />
            </mesh>

            {/* Central Dirt Pitch */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
                <planeGeometry args={[3.05, 20.12]} />
                <meshStandardMaterial color="#9c8163" roughness={1} />
            </mesh>

            {/* Pitch Crease Markings */}
            {[
                { z: -8.8, w: 3.05 }, { z: -7.6, w: 3.6 },
                { z: 8.8, w: 3.05 }, { z: 7.6, w: 3.6 }
            ].map((crease, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, crease.z]}>
                    <planeGeometry args={[crease.w, 0.12]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            ))}

            {/* Render Radar Heatmap Overlay slightly offset towards batters side */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 5]}>
                <planeGeometry args={[22, 22]} />
                <meshBasicMaterial map={heatmapTexture} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>

            {/* Detailed Stumps */}
            <group position={[0, 0.4, 8.8]}>
                {[-0.12, 0, 0.12].map((x, i) => (
                    <mesh key={`stump-bat-${i}`} position={[x, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.02, 0.02, 0.8]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                ))}
            </group>
            <group position={[0, 0.4, -8.8]}>
                {[-0.12, 0, 0.12].map((x, i) => (
                    <mesh key={`stump-bowl-${i}`} position={[x, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.02, 0.02, 0.8]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

function Scene({ activeSuggestion }: { activeSuggestion: number | null }) {
    return (
        <>
            {/* Realistic Stadium Lighting */}
            <ambientLight intensity={0.5} />

            {/* 4 Main Corner Floodlights */}
            <spotLight position={[30, 40, 30]} angle={0.4} penumbra={0.8} intensity={800} color="#e0f2fe" castShadow shadow-mapSize={[1024, 1024]} />
            <spotLight position={[-30, 40, -30]} angle={0.4} penumbra={0.8} intensity={800} color="#e0f2fe" castShadow />
            <spotLight position={[30, 40, -30]} angle={0.4} penumbra={0.8} intensity={800} color="#e0f2fe" castShadow />
            <spotLight position={[-30, 40, 30]} angle={0.4} penumbra={0.8} intensity={800} color="#e0f2fe" castShadow />

            {/* Center Pitch Highlight Light */}
            <pointLight position={[0, 15, 0]} intensity={250} distance={40} color="#ffffff" />
            <pointLight position={[0, 5, 5]} intensity={100} distance={20} color="#06b6d4" />

            <color attach="background" args={["#020617"]} />
            <fog attach="fog" args={["#020617", 10, 60]} />

            <PitchSurface />
            <BallTrajectory />

            {/* 11 Active Fielders */}
            {activeFielders.map((f) => (
                <Marker key={f.id} position={f.position} color="#00f3ff" text={f.role} />
            ))}

            {/* Tactical Suggestions */}
            {suggestions.map((s) => (
                <Marker
                    key={`sug-${s.id}`}
                    position={s.position}
                    color="#10b981"
                    text={s.text}
                    isSuggested={true}
                    isActive={activeSuggestion === s.id}
                />
            ))}

            <OrbitControls
                enablePan={false}
                enableZoom={true}
                maxPolarAngle={Math.PI / 2 - 0.1}
                minPolarAngle={0.1}
                minDistance={8}
                maxDistance={45}
                autoRotate={!activeSuggestion}
                autoRotateSpeed={0.3}
                dampingFactor={0.05}
            />
        </>
    );
}

export default function ThreePitchHeatmap({ activeSuggestion = null }: { activeSuggestion?: number | null }) {
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className="w-full h-full flex items-center justify-center bg-black/60 backdrop-blur-[2px] border border-cyan-500/20 rounded-lg">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 font-mono animate-pulse tracking-widest uppercase">
                Initializing Matrix...
            </div>

            {/* Loader Ring */}
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
        </div>
    );

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black/60 backdrop-blur-[2px] border border-red-500/20 rounded-lg">
                <div className="text-red-400 text-sm font-mono flex flex-col items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    3D Vision Core Offline
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative rounded-lg overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] bg-[#020617] group">
            <Canvas
                shadows
                camera={{ position: [0, 20, 25], fov: 50 }}
                onError={(err) => {
                    console.error("Canvas error:", err);
                    setError(true);
                }}
            >
                <React.Suspense fallback={null}>
                    <Scene activeSuggestion={activeSuggestion} />
                </React.Suspense>
            </Canvas>

            {/* Glowing Border effect on hover */}
            <div className="absolute inset-0 pointer-events-none border border-transparent group-hover:border-cyan-400/50 transition-colors duration-500 rounded-lg" />

            {/* Helpful control hint overlay at the bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-cyan-200/70 font-mono pointer-events-none bg-black/60 px-4 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                Drag: Rotate • Scroll: Zoom
            </div>

            {/* Corner Cyberpunk Hud Elements */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyan-400/70 rounded-tl pointer-events-none shadow-[-2px_-2px_5px_rgba(6,182,212,0.3)]" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-400/70 rounded-tr pointer-events-none shadow-[2px_-2px_5px_rgba(6,182,212,0.3)]" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-400/70 rounded-bl pointer-events-none shadow-[-2px_2px_5px_rgba(6,182,212,0.3)]" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyan-400/70 rounded-br pointer-events-none shadow-[2px_2px_5px_rgba(6,182,212,0.3)]" />

            {/* Live Feed Status */}
            <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none bg-black/40 px-3 py-1 rounded backdrop-blur-sm border border-white/5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,1)]" />
                <span className="text-[10px] font-mono text-white/70 uppercase">Live Analysis</span>
            </div>
        </div>
    );
}
