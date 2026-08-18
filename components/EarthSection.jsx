'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useRef, useMemo, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ───────────────────────────────
   GEOGRAPHIC LAND DETECTION
─────────────────────────────── */
function isLandGeo(lat, lon) {
  // North America
  if (lat > 24 && lat < 72 && lon > -140 && lon < -52) return true;
  // Mexico / Central America
  if (lat > 8  && lat < 25 && lon > -118 && lon < -77) return true;
  // South America
  if (lat > -56 && lat < 13 && lon > -82 && lon < -34) return true;
  // Europe
  if (lat > 36 && lat < 71 && lon > -11 && lon < 40) return true;
  // Africa
  if (lat > -35 && lat < 37 && lon > -18 && lon < 52) return true;
  // Greenland
  if (lat > 59 && lat < 84 && lon > -73 && lon < -17) return true;
  // Iceland
  if (lat > 63 && lat < 67 && lon > -24 && lon < -13) return true;
  // Asia main body (Russia, Central/East Asia)
  if (lat > 35 && lat < 77 && lon > 25  && lon < 145) return true;
  // Middle East / Arabian Peninsula
  if (lat > 12 && lat < 38 && lon > 35  && lon < 65)  return true;
  // South Asia (India, Bangladesh, Sri Lanka)
  if (lat > 6  && lat < 35 && lon > 66  && lon < 92)  return true;
  // Southeast Asia mainland (Myanmar, Thailand, Vietnam)
  if (lat > 0  && lat < 25 && lon > 96  && lon < 110) return true;
  // Maritime Southeast Asia (Indonesia, Philippines, Malaysia)
  if (lat > -8 && lat < 8  && lon > 95  && lon < 142) return true;
  // Russia Far East / Kamchatka
  if (lat > 45 && lat < 70 && lon > 135 && lon < 170) return true;
  // Japan
  if (lat > 30 && lat < 45 && lon > 130 && lon < 145) return true;
  // Australia
  if (lat > -44 && lat < -10 && lon > 113 && lon < 154) return true;
  // New Zealand
  if (lat > -47 && lat < -34 && lon > 166 && lon < 178) return true;
  return false;
}

/* ───────────────────────────────
   LOW-POLY EARTH  (Three.js)
─────────────────────────────── */
function Earth({ mouseRef }) {
  const groupRef = useRef();
  const curX     = useRef(0);
  const curY     = useRef(0);

  const { oceanGeo, landGeo } = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(1.8, 5);
    const g    = base.toNonIndexed();
    base.dispose();

    const pos       = g.attributes.position.array;
    const faceCount = pos.length / 9;
    const oceanCol  = new Float32Array(pos.length);

    const landPos = [];
    const landCol = [];

    for (let i = 0; i < faceCount; i++) {
      const cx = (pos[i*9+0] + pos[i*9+3] + pos[i*9+6]) / 3;
      const cy = (pos[i*9+1] + pos[i*9+4] + pos[i*9+7]) / 3;
      const cz = (pos[i*9+2] + pos[i*9+5] + pos[i*9+8]) / 3;

      const vari  = Math.sin(cx * 17.3 + cy * 23.1 + cz * 13.7) * 0.025;
      const r3d   = Math.sqrt(cx*cx + cy*cy + cz*cz);
      const lat   = Math.asin(Math.max(-1, Math.min(1, cy / r3d))) * (180 / Math.PI);
      const lon   = Math.atan2(cx, cz) * (180 / Math.PI);
      const isIce  = Math.abs(lat) > 72;
      const isLand = !isIce && isLandGeo(lat, lon);

      /* base layer: ocean + ice */
      let r, gv, b;
      if (isIce) {
        r = 0.70 + vari; gv = 0.84 + vari; b = 0.93 + vari;
      } else {
        r = 0.06 + vari; gv = 0.18 + vari; b = 0.52 + vari * 2;
      }
      for (let vi = 0; vi < 3; vi++) {
        oceanCol[i*9 + vi*3 + 0] = Math.max(0, r);
        oceanCol[i*9 + vi*3 + 1] = Math.max(0, gv);
        oceanCol[i*9 + vi*3 + 2] = Math.max(0, b);
      }

      /* land layer: elevated faces */
      if (isLand) {
        const elev = 1.028;
        for (let vi = 0; vi < 3; vi++) {
          const vx = pos[i*9 + vi*3 + 0];
          const vy = pos[i*9 + vi*3 + 1];
          const vz = pos[i*9 + vi*3 + 2];
          landPos.push(vx * elev, vy * elev, vz * elev);
          const lv = Math.sin(vx * 17.3 + vy * 23.1 + vz * 13.7) * 0.025;
          landCol.push(Math.max(0, 0.07 + lv), Math.max(0, 0.33 + lv * 2), Math.max(0, 0.14 + lv));
        }
      }
    }

    g.setAttribute('color', new THREE.BufferAttribute(oceanCol, 3));

    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(landPos), 3));
    lg.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(landCol), 3));
    lg.computeVertexNormals();

    return { oceanGeo: g, landGeo: lg };
  }, []);

  useFrame((_, delta) => {
    curX.current += (mouseRef.current.y * 0.45 - curX.current) * 0.05;
    curY.current += (mouseRef.current.x * 0.7  - curY.current) * 0.05;

    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.22;
    groupRef.current.rotation.x  = curX.current;
  });

  return (
    <group ref={groupRef}>
      {/* base: ocean + ice */}
      <mesh geometry={oceanGeo}>
        <meshPhongMaterial
          vertexColors
          flatShading
          shininess={28}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      {/* second layer: continents elevated */}
      <mesh geometry={landGeo}>
        <meshPhongMaterial
          vertexColors
          flatShading
          shininess={10}
        />
      </mesh>
      {/* neon wireframe overlay */}
      <mesh geometry={oceanGeo}>
        <meshBasicMaterial color="#00e5a0" wireframe transparent opacity={0.14} />
      </mesh>
    </group>
  );
}

function Scene({ mouseRef }) {
  return (
    <>
      <Stars radius={80} depth={50} count={3500} factor={3.5} saturation={0} fade speed={0.4} />
      <ambientLight intensity={0.28} />
      <directionalLight position={[4, 3, 3]}   intensity={2.2} color="#fff8f0" />
      <directionalLight position={[-3, -1, -3]} intensity={0.55} color="#4a7aff" />
      <Earth mouseRef={mouseRef} />
    </>
  );
}

/* ───────────────────────────────
   TILT CARD  (Inspira UI)
─────────────────────────────── */
function TiltCard({ children, className = '' }) {
  const cardRef  = useRef(null);
  const shineRef = useRef(null);

  useEffect(() => {
    const card  = cardRef.current;
    const shine = shineRef.current;
    if (!card) return;

    const onMove = (e) => {
      const r   = card.getBoundingClientRect();
      const dx  = e.clientX - (r.left + r.width  / 2);
      const dy  = e.clientY - (r.top  + r.height / 2);
      const rotX = (dy / (r.height / 2)) * 14;
      const rotY = (dx / (r.width  / 2)) * 14;

      gsap.to(card, {
        rotateX: -rotX, rotateY: rotY,
        transformPerspective: 900,
        ease: 'power2.out', duration: 0.3,
      });

      if (shine) {
        const mx = ((e.clientX - r.left) / r.width)  * 100;
        const my = ((e.clientY - r.top)  / r.height) * 100;
        shine.style.background =
          `radial-gradient(circle at ${mx}% ${my}%, rgba(0,229,160,0.14), transparent 65%)`;
      }
    };

    const onLeave = () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, ease: 'elastic.out(1,0.4)', duration: 1.4 });
      if (shine) shine.style.background = 'none';
    };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`tilt-card spotlight-card ${className}`}
    >
      {/* shine layer */}
      <div ref={shineRef} className="absolute inset-0 rounded-[inherit] pointer-events-none z-10" />
      {children}
    </div>
  );
}

/* ───────────────────────────────
   MAIN SECTION
─────────────────────────────── */
const CARDS = [
  {
    icon: '⬡',
    label: 'Geometria',
    title: 'Low-Poly',
    desc:  'IcosahedronGeometry com cores por face — cada polígono calculado individualmente com pseudo-noise para simular continentes.',
    tags:  ['Three.js', 'WebGL', 'Vertex Colors'],
    color: '#00e5a0',
  },
  {
    icon: '◈',
    label: 'Interação',
    title: 'Mouse Parallax',
    desc:  'O eixo de rotação responde ao cursor em tempo real via lerp. Sem OrbitControls — puro requestAnimationFrame.',
    tags:  ['GSAP', 'rAF', 'Lerp'],
    color: '#3b82f6',
  },
  {
    icon: '✦',
    label: 'Interface',
    title: 'Inspira UI',
    desc:  'Shimmer border com CSS @property, spotlight radial-gradient e tilt 3D com elastic spring-back via GSAP.',
    tags:  ['CSS @property', 'GSAP', 'Tilt 3D'],
    color: '#a78bfa',
  },
];

export default function EarthSection() {
  const sectionRef = useRef(null);
  const labelRef   = useRef(null);
  const titleRef   = useRef(null);
  const descRef    = useRef(null);
  const canvasRef  = useRef(null);
  const cardsRef   = useRef(null);
  const mouseRef   = useRef({ x: 0, y: 0 });

  /* GSAP ScrollTrigger entrance */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [labelRef.current, titleRef.current, descRef.current],
        { opacity: 0, y: 52 },
        {
          opacity: 1, y: 0,
          duration: 0.9, stagger: 0.13, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
        },
      );

      gsap.fromTo(canvasRef.current,
        { opacity: 0, scale: 0.93 },
        {
          opacity: 1, scale: 1,
          duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: canvasRef.current, start: 'top 85%' },
        },
      );

      if (cardsRef.current?.children) {
        gsap.fromTo(
          Array.from(cardsRef.current.children),
          { opacity: 0, y: 64, rotateX: 12 },
          {
            opacity: 1, y: 0, rotateX: 0,
            duration: 0.85, stagger: 0.17, ease: 'power3.out',
            scrollTrigger: { trigger: cardsRef.current, start: 'top 88%' },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* Mouse position for Earth tilt */
  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseRef.current.x =  ((e.clientX - r.left)  / r.width)  * 2 - 1;
    mouseRef.current.y = -((e.clientY - r.top)   / r.height) * 2 + 1;
  };
  const handleMouseLeave = () => { mouseRef.current.x = 0; mouseRef.current.y = 0; };

  return (
    <section
      ref={sectionRef}
      id="earth"
      className="relative py-24 bg-[#050b14] overflow-hidden"
    >
      {/* subtle grid bg */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <p ref={labelRef} className="section-tag justify-center opacity-0">
            Render 3D
          </p>
          <h2
            ref={titleRef}
            data-text="Planeta Terra"
            className="glitch-title text-4xl md:text-5xl font-bold text-white mb-4 opacity-0"
          >
            Planeta <span className="text-[#00e5a0]">Terra</span>
          </h2>
          <p ref={descRef} className="text-[#94a3b8] text-base max-w-lg mx-auto opacity-0">
            Geometria low-poly procedural — cada face colorida individualmente com
            pseudo-noise para simular oceanos, continentes e calotas polares.
          </p>
        </div>

        {/* ── Canvas ── */}
        <div
          ref={canvasRef}
          className="shimmer-border overflow-hidden opacity-0"
          style={{ height: '520px' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <Canvas
            camera={{ position: [0, 0, 4.5], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true }}
          >
            <color attach="background" args={['#050b14']} />
            <Suspense fallback={null}>
              <Scene mouseRef={mouseRef} />
            </Suspense>
          </Canvas>

          <p className="absolute bottom-3 right-4 text-[#334155] text-xs pointer-events-none select-none">
            Mova o mouse para rotacionar
          </p>
        </div>

        {/* ── Tilt Cards ── */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
          style={{ perspective: '1200px' }}
        >
          {CARDS.map((c) => (
            <TiltCard
              key={c.title}
              className="card rounded-2xl p-6 cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className="text-2xl font-mono"
                  style={{ color: c.color, textShadow: `0 0 14px ${c.color}88` }}
                >
                  {c.icon}
                </span>
                <span
                  className="text-[10px] font-mono tracking-widest uppercase border px-2 py-1 rounded-full"
                  style={{ color: c.color, borderColor: `${c.color}44` }}
                >
                  {c.label}
                </span>
              </div>

              <h3 className="text-white font-bold text-lg mb-2">{c.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed mb-4">{c.desc}</p>

              <div className="flex flex-wrap gap-2">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono tracking-wide uppercase px-2 py-0.5 rounded-full"
                    style={{
                      background: `${c.color}10`,
                      color: c.color,
                      border:  `1px solid ${c.color}30`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </TiltCard>
          ))}
        </div>

      </div>
    </section>
  );
}
