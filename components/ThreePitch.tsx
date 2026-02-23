"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line, Sphere, Plane, useTexture } from "@react-three/drei";
import * as THREE from "three";

// Fielder markers with positions (x, y, z) and statuses
const fielders = [
    { id: 1, position: [-5, 0.5, -8], risk: "High", suggestion: "Move Deep Square Leg wider\nLow Risk 94% Conf" },
    { id: 2, position: [6, 0.5, -3], risk: "Med", suggestion: "Bring Long On inside circle\nHigh Risk 78% Conf" },
    { id: 3, position: [2, 0.5, 5], risk: "Low", suggestion: "Deploy Fly Slip\nMed Risk 82% Conf" },
];

function Marker({ position, risk, suggestion }: any) {
    const [hovered, setHovered] = useState(false);
    const color = risk === "High" ? "#ef4444" : risk === "Med" ? "#eab308" : "#10b981";

    return (
        <group position={position}>
            <Sphere args={[0.3, 16, 16]}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
            >
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 2 : 1.5} />
            </Sphere>
            {/* Light glow aura */}
            <Sphere args={[0.5, 16, 16]}>
                <meshBasicMaterial color={color} transparent opacity={0.3} />
            </Sphere>

            {hovered && (
                <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
                    <div className="bg-black/80 backdrop-blur-md border border-cyan-500/50 text-white text-xs p-3 rounded-lg whitespace-pre-wrap shadow-[0_0_15px_rgba(6,182,212,0.5)] pointer-events-none min-w-[150px] text-center font-medium">
                        {suggestion}
                    </div>
                </Html>
            )}
        </group>
    );
}

function BallTrajectory() {
    const lineRef = useRef<any>(null);
    const [dashOffset, setDashOffset] = useState(0);

    useFrame((state, delta) => {
        if (lineRef.current) {
            setDashOffset((prev) => prev - delta * 4);
        }
    });

    const points = useMemo(() => [
        new THREE.Vector3(0, 0.5, -9),  // Bowler end
        new THREE.Vector3(0, 2.5, -2),  // Apex
        new THREE.Vector3(0, 0.1, 6),   // Batter end (pitch spot)
        new THREE.Vector3(0, 0.8, 9),   // Wicket
    ], []);

    // Use a curve to smooth it out
    const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
    const curvePoints = useMemo(() => curve.getPoints(50), [curve]);

    return (
        <Line
            ref={lineRef}
            points={curvePoints}
            color="#06b6d4" // Cyan neon trail
            lineWidth={3}
            dashed
            dashSize={0.5}
            dashOffset={dashOffset}
            gapSize={0.2}
        />
    );
}

function PitchSurface() {
    // Creating a simple gradient texture for heatmap
    const heatmapTexture = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext("2d");
        if (context) {
            const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
            gradient.addColorStop(0, "rgba(239, 68, 68, 0.7)"); // Red at center (high hit zone)
            gradient.addColorStop(0.3, "rgba(234, 179, 8, 0.5)"); // Yellow mid
            gradient.addColorStop(0.7, "rgba(16, 185, 129, 0.2)"); // Green edges (low hit zone)
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)"); // Transparent
            context.fillStyle = gradient;
            context.fillRect(0, 0, 512, 512);
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        return texture;
    }, []);

    return (
        <group>
            {/* Outer oval field */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <circleGeometry args={[22, 64]} />
                <meshStandardMaterial color="#0b3b1c" roughness={0.8} />
            </mesh>

            {/* Stylized grass rings (mowed pattern) */}
            {[18, 14, 10, 6].map((radius, i) => (
                <mesh key={`ring-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
                    <ringGeometry args={[radius - 2, radius, 64]} />
                    <meshBasicMaterial color="rgba(255, 255, 255, 0.02)" transparent />
                </mesh>
            ))}

            {/* 30-yard circle equivalent */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <ringGeometry args={[11.9, 12, 64]} />
                <meshBasicMaterial color="rgba(255, 255, 255, 0.4)" side={THREE.DoubleSide} transparent opacity={0.5} />
            </mesh>

            {/* Boundary rope */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[21.8, 22, 64]} />
                <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
            </mesh>

            {/* The central pitch (rectangular dirt area) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
                <planeGeometry args={[3.05, 20.12]} />
                <meshStandardMaterial color="#8e7354" roughness={0.9} />
            </mesh>

            {/* Pitch Creases */}
            {/* Batting Crease - Bowler End */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -8.8]}>
                <planeGeometry args={[3.05, 0.1]} />
                <meshBasicMaterial color="white" />
            </mesh>
            {/* Popping Crease - Bowler End */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -7.6]}>
                <planeGeometry args={[3.6, 0.1]} />
                <meshBasicMaterial color="white" />
            </mesh>

            {/* Batting Crease - Batter End */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 8.8]}>
                <planeGeometry args={[3.05, 0.1]} />
                <meshBasicMaterial color="white" />
            </mesh>
            {/* Popping Crease - Batter End */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 7.6]}>
                <planeGeometry args={[3.6, 0.1]} />
                <meshBasicMaterial color="white" />
            </mesh>

            {/* Heatmap overlay on pitch/field */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 4]}>
                <planeGeometry args={[18, 18]} />
                <meshBasicMaterial map={heatmapTexture} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
            </mesh>

            {/* Stumps - Batter end (z=9 base) */}
            <group position={[0, 0.4, 9]}>
                {[-0.15, 0, 0.15].map((x, i) => (
                    <mesh key={`stump-bat-${i}`} position={[x, 0, 0]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.8]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                ))}
                {/* Bails */}
                <mesh position={[-0.075, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.14]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0.075, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.14]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
            </group>

            {/* Stumps - Bowler end (z=-9 base) */}
            <group position={[0, 0.4, -9]}>
                {[-0.15, 0, 0.15].map((x, i) => (
                    <mesh key={`stump-bowl-${i}`} position={[x, 0, 0]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.8]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.4} />
            {/* Floodlights */}
            <spotLight position={[20, 30, 20]} angle={0.3} penumbra={1} intensity={500} color="#e0f2fe" castShadow />
            <spotLight position={[-20, 30, -20]} angle={0.3} penumbra={1} intensity={500} color="#e0f2fe" castShadow />
            <spotLight position={[20, 30, -20]} angle={0.3} penumbra={1} intensity={500} color="#e0f2fe" castShadow />
            <spotLight position={[-20, 30, 20]} angle={0.3} penumbra={1} intensity={500} color="#e0f2fe" castShadow />

            <pointLight position={[0, 10, 0]} intensity={20} distance={50} color="#06b6d4" />

            {/* Background (Night sky gradient approximation) */}
            <color attach="background" args={["#020617"]} />
            <fog attach="fog" args={["#020617", 15, 45]} />

            <PitchSurface />
            <BallTrajectory />

            {fielders.map((f) => (
                <Marker key={f.id} position={f.position} risk={f.risk} suggestion={f.suggestion} />
            ))}

            <OrbitControls
                enablePan={false}
                enableZoom={true}
                maxPolarAngle={Math.PI / 2 - 0.05}
                minDistance={5}
                maxDistance={35}
                autoRotate
                autoRotateSpeed={0.5}
            />
        </>
    );
}

export default function ThreePitch() {
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] relative overflow-hidden text-cyan-400 font-mono text-sm border border-cyan-500/20 rounded-lg">
            <div className="animate-pulse">Loading Matrix...</div>
        </div>
    );

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black/60 backdrop-blur-[2px] relative overflow-hidden border border-red-500/20 rounded-lg">
                {/* Fallback Static SVG Pitch */}
                <div className="text-gray-400 text-sm">3D View Unavailable - Using 2D Fallback</div>
                <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] z-20" />
                <div className="absolute top-3/4 left-2/3 w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.8)] z-20" />
            </div>
        );
    }

    return (
        <div className="w-full h-full relative rounded-lg overflow-hidden border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] bg-[#020617]">
            <Canvas
                camera={{ position: [0, 12, 18], fov: 55 }}
                onCreated={(state) => {
                    state.gl.setClearColor("#020617");
                }}
                onError={(err) => {
                    console.error("Canvas error:", err);
                    setError(true);
                }}
            >
                <React.Suspense fallback={<Html center><span className="text-cyan-400 animate-pulse font-mono flex items-center gap-2 whitespace-nowrap bg-black/50 px-4 py-2 rounded-lg border border-cyan-500/30">Initializing 3D Matrix...</span></Html>}>
                    <Scene />
                </React.Suspense>
            </Canvas>

            {/* Overlay controls hint */}
            <div className="absolute bottom-4 left-4 text-[10px] text-cyan-200/50 font-mono pointer-events-none bg-black/40 px-2 py-1 rounded border border-cyan-500/20 backdrop-blur-sm uppercase tracking-wider">
                Drag: Rotate • Scroll: Zoom
            </div>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 rounded-tl pointer-events-none" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50 rounded-tr pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50 rounded-bl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50 rounded-br pointer-events-none" />
        </div>
    );
}
