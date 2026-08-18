'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function RimLight({ position, color, phase }) {
  const matRef  = useRef();
  const haloRef = useRef();
  useFrame(({ clock }) => {
    const v = 0.5 + Math.sin(clock.elapsedTime * 2.5 + phase) * 0.45;
    if (matRef.current)  matRef.current.emissiveIntensity  = v;
    if (haloRef.current) haloRef.current.material.opacity  = v * 0.14;
  });
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial ref={matRef} color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} />
      </mesh>
    </group>
  );
}

function AntennaGlow({ color }) {
  const matRef = useRef();
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.emissiveIntensity = 0.8 + Math.sin(clock.elapsedTime * 2.2) * 0.7;
  });
  return (
    <group position={[0, 0.9, 0]}>
      <mesh>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial ref={matRef} color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

function Nozzle({ position, color }) {
  const matRef   = useRef();
  const lightRef = useRef();
  useFrame(({ clock }) => {
    const pulse = 0.5 + Math.sin(clock.elapsedTime * 4 + position[0] * 3) * 0.5;
    if (matRef.current)  matRef.current.emissiveIntensity = 0.3 + pulse * 0.6;
    if (lightRef.current) lightRef.current.intensity = 0.08 + pulse * 0.18;
  });
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.022, 8, 16]} />
        <meshStandardMaterial ref={matRef} color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.065, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={0.1} distance={0.6} />
    </group>
  );
}

function Dome({ color }) {
  const lightRef = useRef();
  useFrame(({ clock }) => {
    if (lightRef.current)
      lightRef.current.intensity = 0.35 + Math.sin(clock.elapsedTime * 1.8) * 0.2;
  });
  return (
    <group position={[0, 0.18, 0]}>
      {/* Outer glass shell */}
      <mesh>
        <sphereGeometry args={[0.52, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} transparent opacity={0.18} metalness={0} roughness={0} side={THREE.FrontSide} />
      </mesh>
      {/* Inner atmosphere glow */}
      <mesh>
        <sphereGeometry args={[0.47, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>
      {/* Bottom fill */}
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.33, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.04} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={0.35} distance={1.6} />
    </group>
  );
}

function AuraRing({ color }) {
  const matRef = useRef();
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.opacity = 0.035 + Math.sin(clock.elapsedTime * 1.4) * 0.025;
  });
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.38, 0.2, 4, 48]} />
      <meshBasicMaterial ref={matRef} color={color} transparent opacity={0.04} side={THREE.DoubleSide} />
    </mesh>
  );
}

function UFOMesh({ beamActive, isEnemy }) {
  const groupRef   = useRef();
  const accentColor = isEnemy ? '#ff4545' : '#00e5a0';
  const bodyColor   = isEnemy ? '#2a0808'  : '#0a1828';
  const panelColor  = isEnemy ? '#1a0404'  : '#060e18';
  const lightColors = isEnemy
    ? ['#ff4545','#ff8c00','#ff4545','#ff8c00','#ff4545','#ff8c00','#ff4545','#ff8c00']
    : ['#00e5a0','#3b82f6','#a78bfa','#00e5a0','#3b82f6','#a78bfa','#00e5a0','#3b82f6'];

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.y += isEnemy ? -0.012 : 0.012;
    groupRef.current.rotation.x  = Math.sin(t * 0.7)  * 0.05;
    groupRef.current.rotation.z  = Math.cos(t * 0.5)  * 0.04;
  });

  const rimLights = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return { position: [Math.cos(a) * 0.92, -0.07, Math.sin(a) * 0.92], color: lightColors[i], phase: i * 0.7 };
  });

  const nozzles = [0, 1, 2].map(i => {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    return [Math.cos(a) * 0.44, -0.17, Math.sin(a) * 0.44];
  });

  return (
    <group ref={groupRef}>

      {/* ── SHADOW HALO ── */}
      <mesh position={[0, -0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.35, 32]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.05} />
      </mesh>

      {/* ── BODY ── */}
      {/* Top bevel */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.1, 1.22, 0.07, 48]} />
        <meshStandardMaterial color={bodyColor} metalness={0.95} roughness={0.08} />
      </mesh>
      {/* Main disc */}
      <mesh>
        <cylinderGeometry args={[1.02, 1.1, 0.2, 48]} />
        <meshStandardMaterial color={bodyColor} metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Equator accent band */}
      <mesh>
        <torusGeometry args={[1.06, 0.035, 8, 48]} />
        <meshStandardMaterial color={panelColor} metalness={1} roughness={0.04} />
      </mesh>
      {/* Bottom bevel */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.22, 1.1, 0.07, 48]} />
        <meshStandardMaterial color={bodyColor} metalness={0.95} roughness={0.08} />
      </mesh>
      {/* Glowing rim */}
      <mesh>
        <torusGeometry args={[1.16, 0.048, 8, 48]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.45} metalness={0.3} roughness={0.35} />
      </mesh>

      {/* ── UNDER PANEL ── */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.66, 0.72, 0.08, 32]} />
        <meshStandardMaterial color={panelColor} metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh position={[0, -0.135, 0]}>
        <cylinderGeometry args={[0.4, 0.66, 0.04, 32]} />
        <meshStandardMaterial color={bodyColor} metalness={0.9} roughness={0.15} />
      </mesh>

      {/* ── ENGINE NOZZLES ── */}
      {nozzles.map((pos, i) => <Nozzle key={i} position={pos} color={accentColor} />)}

      {/* ── DOME ── */}
      <Dome color={accentColor} />

      {/* ── ANTENNA ── */}
      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.36, 8]} />
        <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.1} />
      </mesh>
      <AntennaGlow color={accentColor} />

      {/* ── RIM LIGHTS ── */}
      {rimLights.map((l, i) => <RimLight key={i} {...l} />)}

      {/* ── AURA RING ── */}
      <AuraRing color={accentColor} />

      {/* ── TRACTOR BEAM ── */}
      {beamActive && (
        <>
          <mesh position={[0, -0.65, 0]}>
            <coneGeometry args={[0.55, 1.2, 32, 1, true]} />
            <meshBasicMaterial color={accentColor} transparent opacity={0.22} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.65, 0]}>
            <coneGeometry args={[0.78, 1.2, 32, 1, true]} />
            <meshBasicMaterial color={accentColor} transparent opacity={0.07} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

    </group>
  );
}

export function UFO3D({ beamActive = false, isEnemy = false }) {
  const accent = isEnemy ? '#ff4545' : '#00e5a0';
  const fill   = isEnemy ? '#ff8800' : '#3b82f6';
  return (
    <Canvas
      camera={{ position: [0, 0.6, 3.4], fov: 40 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.12} />
      <pointLight position={[2, 3, 2]}   intensity={2.0} color="#e8f4ff" />
      <pointLight position={[-2.5, 1, 1]} intensity={0.6} color={fill} />
      <pointLight position={[0, -2, 0.5]} intensity={1.4} color={accent} />
      <pointLight position={[0, 1, -2]}   intensity={0.4} color={accent} />
      <UFOMesh beamActive={beamActive} isEnemy={isEnemy} />
    </Canvas>
  );
}
