'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useRef, useState, useMemo, Suspense } from 'react';
import * as THREE from 'three';

const PLANETS = [
  { name: 'Mercúrio', textureKey: 'mercury', radius: 0.06, distance: 2.8,  speed: 2.60,  info: 'O menor planeta — orbita o Sol em apenas 88 dias.',          moons: 0   },
  { name: 'Vênus',    textureKey: 'venus',   radius: 0.14, distance: 4.0,  speed: 1.02,  info: 'O mais quente — superfície a 465 °C.',                        moons: 0   },
  { name: 'Terra',    textureKey: 'earth',   radius: 0.15, distance: 5.5,  speed: 0.63,  info: 'Nosso lar — o único planeta com vida conhecida.',             moons: 1   },
  { name: 'Marte',    textureKey: 'mars',    radius: 0.09, distance: 7.2,  speed: 0.34,  info: 'O Planeta Vermelho — tem o maior vulcão do sistema solar.',   moons: 2   },
  { name: 'Júpiter',  textureKey: 'jupiter', radius: 0.50, distance: 10.5, speed: 0.053, info: 'O maior planeta — cabe 1.300 Terras dentro dele.',            moons: 95  },
  { name: 'Saturno',  textureKey: 'saturn',  radius: 0.42, distance: 14.0, speed: 0.021, info: 'Famoso pelos anéis — menos denso que a água.',                moons: 146, hasRings: true },
  { name: 'Urano',    textureKey: 'uranus',  radius: 0.25, distance: 18.0, speed: 0.0074,info: 'Gira de lado — eixo inclinado a 98°.',                        moons: 28  },
  { name: 'Netuno',   textureKey: 'neptune', radius: 0.24, distance: 22.0, speed: 0.0038,info: 'O mais distante — ventos de até 2.100 km/h.',                 moons: 16  },
];

const PLANET_COLORS = {
  Mercúrio: '#b0adb0', Vênus: '#e8c76a', Terra: '#4fa3e0',
  Marte: '#c1440e', Júpiter: '#c88b3a', Saturno: '#e4d191',
  Urano: '#7de8e8', Netuno: '#3f54ba',
};

/* ─── Atmosphere vertex / fragment shaders ─── */
const atmoVert = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const atmoFrag = `
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float rim = 1.0 - max(dot(vViewDir, vNormal), 0.0);
    rim = pow(rim, 2.5);
    gl_FragColor = vec4(uColor, rim * 0.75);
  }
`;

function OrbitPath({ distance }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[distance - 0.012, distance + 0.012, 128]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.09} side={THREE.DoubleSide} />
    </mesh>
  );
}

function EarthAtmosphere({ radius }) {
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color('#5ab4ff') } }), []);
  return (
    <mesh>
      <sphereGeometry args={[radius * 1.07, 32, 32]} />
      <shaderMaterial
        vertexShader={atmoVert}
        fragmentShader={atmoFrag}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function EarthClouds({ radius, cloudTexture }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.04;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius * 1.012, 64, 64]} />
      <meshStandardMaterial
        alphaMap={cloudTexture}
        transparent
        color="#ffffff"
        opacity={0.75}
        depthWrite={false}
        roughness={1}
      />
    </mesh>
  );
}

function SaturnRings({ radius, ringTexture }) {
  const geo = useMemo(() => {
    const inner = radius * 1.4;
    const outer = radius * 2.5;
    const g = new THREE.RingGeometry(inner, outer, 128, 1);
    const pos = g.attributes.position;
    const uv  = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const d = Math.sqrt(x * x + y * y);
      uv.setX(i, (d - inner) / (outer - inner));
      uv.setY(i, 0.5);
    }
    uv.needsUpdate = true;
    return g;
  }, [radius]);

  return (
    <mesh geometry={geo} rotation={[Math.PI / 5, 0, 0]}>
      <meshBasicMaterial
        map={ringTexture}
        alphaMap={ringTexture}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Sun({ sunTexture }) {
  const coreRef  = useRef();
  const outerRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (coreRef.current)  coreRef.current.rotation.y  += 0.002;
    if (outerRef.current) outerRef.current.material.opacity = 0.07 + Math.sin(t * 1.3) * 0.025;
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshStandardMaterial
          map={sunTexture}
          emissive="#FF6B00"
          emissiveMap={sunTexture}
          emissiveIntensity={2.0}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.12, 32, 32]} />
        <meshBasicMaterial color="#FFA000" transparent opacity={0.09} side={THREE.BackSide} />
      </mesh>
      <mesh ref={outerRef}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial color="#FF5500" transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function Planet({ data, textures, onHover, onLeave }) {
  const groupRef   = useRef();
  const angle      = useRef(Math.random() * Math.PI * 2);
  const hoveredRef = useRef(false);
  const scaleRef   = useRef(1);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((_, delta) => {
    angle.current += data.speed * delta;
    if (!groupRef.current) return;
    groupRef.current.position.set(
      Math.cos(angle.current) * data.distance,
      0,
      Math.sin(angle.current) * data.distance,
    );
    groupRef.current.rotation.y += delta * 0.8;
    const target = hoveredRef.current ? 1.35 : 1.0;
    scaleRef.current += (target - scaleRef.current) * Math.min(delta * 10, 1);
    groupRef.current.scale.setScalar(scaleRef.current);
  });

  const handleEnter = (e) => { e.stopPropagation(); hoveredRef.current = true;  setIsHovered(true);  onHover(data); };
  const handleLeave = (e) => { e.stopPropagation(); hoveredRef.current = false; setIsHovered(false); onLeave();     };

  return (
    <group ref={groupRef}>
      <mesh onPointerEnter={handleEnter} onPointerLeave={handleLeave}>
        <sphereGeometry args={[data.radius, 64, 64]} />
        <meshStandardMaterial
          map={textures[data.textureKey]}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {data.name === 'Terra' && (
        <>
          <EarthClouds radius={data.radius} cloudTexture={textures.earth_clouds} />
          <EarthAtmosphere radius={data.radius} />
        </>
      )}

      {data.hasRings && (
        <SaturnRings radius={data.radius} ringTexture={textures.saturn_rings} />
      )}

      {isHovered && (
        <mesh>
          <sphereGeometry args={[data.radius * 2.2, 16, 16]} />
          <meshBasicMaterial
            color={PLANET_COLORS[data.name] ?? '#ffffff'}
            transparent opacity={0.06}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}

function Scene({ onHover, onLeave }) {
  const textures = useTexture({
    sun:          '/textures/sun.jpg',
    mercury:      '/textures/mercury.jpg',
    venus:        '/textures/venus.jpg',
    earth:        '/textures/earth.jpg',
    earth_clouds: '/textures/earth_clouds.jpg',
    mars:         '/textures/mars.jpg',
    jupiter:      '/textures/jupiter.jpg',
    saturn:       '/textures/saturn.jpg',
    saturn_rings: '/textures/saturn_rings.png',
    uranus:       '/textures/uranus.jpg',
    neptune:      '/textures/neptune.jpg',
  });

  return (
    <>
      <Stars radius={80} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
      <ambientLight intensity={0.04} />
      <pointLight position={[0, 0, 0]} intensity={5} distance={70} color="#FFF5E0" />

      <Sun sunTexture={textures.sun} />

      {PLANETS.map(p => <OrbitPath key={`orb-${p.name}`} distance={p.distance} />)}
      {PLANETS.map(p => (
        <Planet key={p.name} data={p} textures={textures} onHover={onHover} onLeave={onLeave} />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={38}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI / 2}
      />

      <EffectComposer>
        <Bloom
          intensity={1.4}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function SolarSystem() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="relative py-24 bg-[#050b14] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-10 text-center">
        <p className="text-[#00e5a0] text-sm font-mono tracking-widest uppercase mb-3">
          Explore
        </p>
        <h2 className="text-4xl font-bold text-white mb-4">Sistema Solar</h2>
        <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">
          Todos os 8 planetas do nosso sistema solar, em órbita em tempo real.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div
          className="relative rounded-2xl overflow-hidden border border-[#142238]"
          style={{ height: '560px' }}
        >
          {hovered && (
            <div className="absolute top-4 left-4 z-10 bg-[#0c1a2e]/90 border border-[#142238] backdrop-blur-sm rounded-xl p-4 w-64 pointer-events-none">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: PLANET_COLORS[hovered.name] ?? '#fff' }}
                />
                <h3 className="text-white font-semibold text-base">{hovered.name}</h3>
              </div>
              <p className="text-[#94a3b8] text-sm leading-relaxed mt-1">{hovered.info}</p>
              {hovered.moons > 0 && (
                <p className="text-[#60a5fa] text-xs mt-2 font-mono">
                  {hovered.moons} {hovered.moons === 1 ? 'lua' : 'luas'}
                </p>
              )}
            </div>
          )}

          <Canvas
            camera={{ position: [0, 20, 22], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true }}
          >
            <color attach="background" args={['#050b14']} />
            <Suspense fallback={null}>
              <Scene onHover={setHovered} onLeave={() => setHovered(null)} />
            </Suspense>
          </Canvas>

          <p className="absolute bottom-3 right-4 text-[#475569] text-xs pointer-events-none select-none">
            Arraste para girar · Scroll para zoom · Passe o mouse nos planetas
          </p>
        </div>
      </div>
    </section>
  );
}
