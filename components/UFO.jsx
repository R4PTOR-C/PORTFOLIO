'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue, useAnimation } from 'framer-motion';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Player UFO (green) ───────────────────────────────────────────────────────
function UFOSvg({ beamActive }) {
  return (
    <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="ufoBodyGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0a1828" />
        </radialGradient>
        <radialGradient id="ufoDomeGrad" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="rgba(0,229,160,0.4)" />
          <stop offset="100%" stopColor="rgba(0,229,160,0.08)" />
        </radialGradient>
        <radialGradient id="beamGrad" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="rgba(0,229,160,0.18)" />
          <stop offset="100%" stopColor="rgba(0,229,160,0)" />
        </radialGradient>
        <filter id="ufoGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {beamActive && (
        <motion.polygon
          points="45,42 75,42 95,110 25,110"
          fill="url(#beamGrad)"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0 }}
          style={{ transformOrigin: '60px 42px' }}
          transition={{ duration: 0.4 }}
        />
      )}

      <ellipse cx="60" cy="46" rx="38" ry="7" fill="rgba(0,229,160,0.08)" filter="url(#ufoGlow)" />
      <ellipse cx="60" cy="38" rx="42" ry="10" fill="url(#ufoBodyGrad)" stroke="rgba(0,229,160,0.3)" strokeWidth="0.8" />
      <ellipse cx="60" cy="40" rx="30" ry="5" fill="#0c1e34" stroke="rgba(0,229,160,0.2)" strokeWidth="0.6" />

      {[-18, -10, -2, 6, 14, 22].map((x, i) => (
        <motion.circle key={i} cx={60 + x} cy={42} r={2}
          fill={['#00e5a0','#3b82f6','#a78bfa','#00e5a0','#3b82f6','#a78bfa'][i]}
          animate={{ opacity: [0.9, 0.2, 0.9] }}
          transition={{ duration: 1.2, delay: i * 0.18, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <ellipse cx="60" cy="30" rx="18" ry="12" fill="url(#ufoDomeGrad)" stroke="rgba(0,229,160,0.25)" strokeWidth="0.7" />
      <ellipse cx="55" cy="26" rx="6" ry="4" fill="rgba(255,255,255,0.06)" />
      <line x1="60" y1="18" x2="60" y2="12" stroke="rgba(0,229,160,0.5)" strokeWidth="1" strokeLinecap="round" />
      <motion.circle cx="60" cy="11" r="2.5" fill="#00e5a0"
        animate={{ opacity: [1, 0.2, 1], r: [2.5, 3.5, 2.5] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

// ── Enemy UFO (red, mirrored) ────────────────────────────────────────────────
function EnemyUFOSvg() {
  return (
    <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ transform: 'scaleX(-1)' }}>
      <defs>
        <radialGradient id="eBodyGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#3d0a0a" />
          <stop offset="100%" stopColor="#1a0404" />
        </radialGradient>
        <radialGradient id="eDomeGrad" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="rgba(255,69,69,0.45)" />
          <stop offset="100%" stopColor="rgba(255,69,69,0.08)" />
        </radialGradient>
        <filter id="eGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <ellipse cx="60" cy="46" rx="38" ry="7" fill="rgba(255,69,69,0.1)" filter="url(#eGlow)" />
      <ellipse cx="60" cy="38" rx="42" ry="10" fill="url(#eBodyGrad)" stroke="rgba(255,69,69,0.35)" strokeWidth="0.8" />
      <ellipse cx="60" cy="40" rx="30" ry="5" fill="#1a0404" stroke="rgba(255,69,69,0.2)" strokeWidth="0.6" />

      {[-18, -10, -2, 6, 14, 22].map((x, i) => (
        <motion.circle key={i} cx={60 + x} cy={42} r={2}
          fill={['#ff4545','#ff8c00','#ff4545','#ff8c00','#ff4545','#ff8c00'][i]}
          animate={{ opacity: [0.9, 0.2, 0.9] }}
          transition={{ duration: 1.0, delay: i * 0.13, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <ellipse cx="60" cy="30" rx="18" ry="12" fill="url(#eDomeGrad)" stroke="rgba(255,69,69,0.3)" strokeWidth="0.7" />
      <ellipse cx="55" cy="26" rx="6" ry="4" fill="rgba(255,100,100,0.07)" />
      <line x1="60" y1="18" x2="60" y2="12" stroke="rgba(255,69,69,0.5)" strokeWidth="1" strokeLinecap="round" />
      <motion.circle cx="60" cy="11" r="2.5" fill="#ff4545"
        animate={{ opacity: [1, 0.2, 1], r: [2.5, 3.5, 2.5] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

// ── Laser bolt ───────────────────────────────────────────────────────────────
function LaserBolt({ fromEnemy, top, onDone }) {
  const isEnemy = fromEnemy;
  return (
    <motion.div
      className="fixed z-[9988] pointer-events-none rounded-full"
      style={{
        top,
        height: 3,
        width: 80,
        ...(isEnemy ? { left: 110 } : { right: 110 }),
        background: isEnemy
          ? 'linear-gradient(to right, #ff4545, #ffaa44)'
          : 'linear-gradient(to left, #00e5a0, #00ffaa)',
        boxShadow: isEnemy
          ? '0 0 10px #ff4545, 0 0 3px #ff0000'
          : '0 0 10px #00e5a0, 0 0 3px #00ff99',
      }}
      initial={{ x: 0, opacity: 1 }}
      animate={{ x: isEnemy ? '95vw' : '-95vw', opacity: [1, 1, 1, 0] }}
      transition={{ duration: 0.28, ease: 'linear' }}
      onAnimationComplete={onDone}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UFO() {
  const scrollY     = useMotionValue(0);
  const [beam,      setBeam]      = useState(false);
  const [showEnemy, setShowEnemy] = useState(false);
  const [lasers,    setLasers]    = useState([]);
  const [fighting,  setFighting]  = useState(false);

  const ufoRef      = useRef(null);
  const timerRef    = useRef(null);
  const laserIdRef  = useRef(0);
  const enemyControls = useAnimation();
  const [battleTop, setBattleTop] = useState(64);

  useEffect(() => {
    const onScroll = () => scrollY.set(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });

    const beamLoop = () => {
      const delay = 4000 + Math.random() * 6000;
      timerRef.current = setTimeout(() => {
        if (!fighting) setBeam(true);
        setTimeout(() => { setBeam(false); beamLoop(); }, 1800);
      }, delay);
    };
    beamLoop();

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timerRef.current);
    };
  }, [fighting]);

  const y       = useTransform(scrollY, [0, 3000], [8, 444]);
  const x       = useTransform(scrollY, [0, 3000], [0, -40]);
  const springY = useSpring(y, { stiffness: 40, damping: 18 });
  const springX = useSpring(x, { stiffness: 40, damping: 18 });

  const addLaser = (fromEnemy) => {
    const rect = ufoRef.current?.getBoundingClientRect();
    const top  = rect ? rect.top + rect.height / 2 - 1 : 120;
    const id   = laserIdRef.current++;
    setLasers(prev => [...prev, { id, fromEnemy, top }]);
  };

  const removeLaser = (id) => setLasers(prev => prev.filter(l => l.id !== id));

  const startBattle = async () => {
    if (fighting) return;
    setFighting(true);
    setBeam(false);

    const rect = ufoRef.current?.getBoundingClientRect();
    setBattleTop(rect ? rect.top : 64);

    // Enemy enters from off-screen left
    setShowEnemy(true);
    enemyControls.set({ x: -160, opacity: 1, scale: 1, rotate: 0 });
    await enemyControls.start({ x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } });

    // Enemy bobs while fighting
    enemyControls.start({
      y: [0, -5, 0],
      transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
    });

    // Rapid laser exchange
    await sleep(200); addLaser(false);
    await sleep(320); addLaser(true);
    await sleep(260); addLaser(false);
    await sleep(290); addLaser(true);
    await sleep(240); addLaser(false);
    await sleep(310); addLaser(true);
    await sleep(220); addLaser(false); // killing shot

    // Enemy takes the hit — shake
    await sleep(280);
    await enemyControls.start({
      x: [0, -10, 10, -8, 8, -5, 0],
      y: [0, -4, 4, -3, 0],
      transition: { duration: 0.45 },
    });

    // Enemy flees
    await enemyControls.start({
      x: -500,
      scale: 0.4,
      opacity: 0,
      transition: { duration: 0.38, ease: [0.76, 0, 0.24, 1] },
    });

    setShowEnemy(false);
    setFighting(false);
  };

  return (
    <>
      {/* Player UFO */}
      <motion.div
        ref={ufoRef}
        className="fixed right-4 md:right-10 z-40"
        style={{ top: '64px', y: springY, x: springX, width: '100px', height: '58px' }}
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 8 }}
        transition={{ delay: 2.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          onClick={startBattle}
          whileHover={!fighting ? { scale: 1.1 } : {}}
          style={{ cursor: fighting ? 'default' : 'pointer' }}
          title="👽"
        >
          <UFOSvg beamActive={beam} />
        </motion.div>
      </motion.div>

      {/* Enemy UFO */}
      <AnimatePresence>
        {showEnemy && (
          <motion.div
            className="fixed left-4 md:left-10 z-40 pointer-events-none"
            style={{ top: battleTop, width: '100px', height: '58px' }}
            animate={enemyControls}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full h-full"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <EnemyUFOSvg />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Laser bolts */}
      <AnimatePresence>
        {lasers.map(l => (
          <LaserBolt key={l.id} fromEnemy={l.fromEnemy} top={l.top} onDone={() => removeLaser(l.id)} />
        ))}
      </AnimatePresence>
    </>
  );
}
