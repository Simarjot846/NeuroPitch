"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line, Sphere } from "@react-three/drei";
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

// Suggestions matching the IDs in page.tsx
const suggestions = [
    { id: 1, position: [-16, 0.5, 4], risk: "Low", text: "Move Deep Square Leg wider\nLow Risk 94% Conf" },
    { id: 2, position: [-8, 0.5, -12], risk: "High", text: "Bring Long On inside circle\nHigh Risk 78% Conf" },
    { id: 3, position: [4, 0.5, 9], risk: "Med", text: "Deploy Fly Slip\nMed Risk 82% Conf" },
];

function Marker({ position, color, text, isSuggested = false, isActive = false }: any) {
    const [hovered, setHovered] = useState(false);

    // Scale up if it's the active suggestion
    const scale = isActive ? 1.5 : 1;
    const glowIntensity = isActive || hovered ? 2.5 : 1.2;

    return (
        <group position={position} scale={[scale, scale, scale]}>
            <Sphere
                args={[0.3, 16, 16]}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
            >
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glowIntensity} />
            </Sphere>

            {/* Light glow aura */}
            <Sphere args={[0.6, 16, 16]}>
                <meshBasicMaterial color={color} transparent opacity={isActive ? 0.5 : 0.2} blending={THREE.AdditiveBlending} />
            </Sphere>

            {(hovered || isActive) && (
                <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
                    <div className="bg-black/80 backdrop-blur-md border border-cyan-500/50 text-white text-xs p-3 rounded-lg whitespace-pre-wrap shadow-[0_0_15px_rgba(6,182,212,0.5)] pointer-events-none min-w-[150px] text-center font-medium">
                        {text}
                    </div>
                </Html>
            )}

            {isSuggested && isActive && (
                <Html position={[0, 2.5, 0]} center>
                    <div className="animate-bounce">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-neonGreen" />
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
        new THREE.Vector3(0, 0.5, -8.5),  // Bowler end
        new THREE.Vector3(0, 2.0, -2),  // Apex
        new THREE.Vector3(0, 0.1, 5),   // Batter end pitch spot
        new THREE.Vector3(0, 0.6, 8.5),   // Wicket
    ], []);

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
    const heatmapTexture = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext("2d");
        if (context) {
            const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
            gradient.addColorStop(0, "rgba(239, 68, 68, 0.8)"); // Red high hit zone
            gradient.addColorStop(0.3, "rgba(234, 179, 8, 0.5)"); // Yellow mid
            gradient.addColorStop(0.7, "rgba(16, 185, 129, 0.2)"); // Green safe
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

            {/* Stylized grass rings */}
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

            {/* Central pitch (dirt) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
                <planeGeometry args={[3.05, 20.12]} />
                <meshStandardMaterial color="#8e7354" roughness={0.9} />
            </mesh>

            {/* Creases */}
            {[
                { z: -8.8, w: 3.05 }, { z: -7.6, w: 3.6 },
                { z: 8.8, w: 3.05 }, { z: 7.6, w: 3.6 }
            ].map((crease, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, crease.z]}>
                    <planeGeometry args={[crease.w, 0.1]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            ))}

            {/* Heatmap overlay */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 4]}>
                <planeGeometry args={[18, 18]} />
                <meshBasicMaterial map={heatmapTexture} transparent opacity={0.7} blending={THREE.AdditiveBlending} />
            </mesh>

            {/* Stumps */}
            <group position={[0, 0.4, 8.8]}>
                {[-0.15, 0, 0.15].map((x, i) => (
                    <mesh key={`stump-bat-${i}`} position={[x, 0, 0]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.8]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                ))}
            </group>
            <group position={[0, 0.4, -8.8]}>
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

function Scene({ activeSuggestion }: { activeSuggestion: number | null }) {
    return (
        <>
            <ambientLight intensity={0.4} />
            <spotLight position={[20, 30, 20]} angle={0.3} penumbra={1} intensity={500} color="#e0f2fe" castShadow />
            <spotLight position={[-20, 30, -20]} angle={0.3} penumbra={1} intensity={500} color="#e0f2fe" castShadow />
            <spotLight position={[20, 30, -20]} angle={0.3} penumbra={1} intensity={500} color="#e0f2fe" castShadow />
            <spotLight position={[-20, 30, 20]} angle={0.3} penumbra={1} intensity={500} color="#e0f2fe" castShadow />
            <pointLight position={[0, 10, 0]} intensity={20} distance={50} color="#06b6d4" />

            <color attach="background" args={["#020617"]} />
            <fog attach="fog" args={["#020617", 15, 45]} />

            <PitchSurface />
            <BallTrajectory />

            {/* Render 11 standard fielders */}
            {activeFielders.map((f) => (
                <Marker key={f.id} position={f.position} color="#06b6d4" text={f.role} />
            ))}

            {/* Render Suggested Alterations */}
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
                maxPolarAngle={Math.PI / 2 - 0.05}
                minDistance={5}
                maxDistance={35}
                autoRotate={!activeSuggestion} // Stop rotation when a suggestion is active
                autoRotateSpeed={0.5}
            />
        </>
    );
}

export default function ThreeHeatmap({ activeSuggestion = null }: { activeSuggestion?: number | null }) {
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className="w-full h-full flex items-center justify-center bg-black/60 backdrop-blur-[2px] border border-cyan-500/20 rounded-lg">
            <div className="text-cyan-400 font-mono animate-pulse">Loading Matrix...</div>
        </div>
    );

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black/60 backdrop-blur-[2px] border border-red-500/20 rounded-lg">
                <div className="text-red-400 text-sm">3D View Unavailable</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative rounded-lg overflow-hidden border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] bg-[#020617]">
            <Canvas
                camera={{ position: [0, 15, 20], fov: 55 }}
                onError={(err) => {
                    console.error("Canvas error:", err);
                    setError(true);
                }}
            >
                <React.Suspense fallback={null}>
                    <Scene activeSuggestion={activeSuggestion} />
                </React.Suspense>
            </Canvas>

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
