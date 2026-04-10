'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import UFOTerminal from '@/components/UFOTerminal';

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

export default function UFO() {
  const scrollY  = useMotionValue(0);
  const [beam,    setBeam]    = useState(false);
  const [terminal, setTerminal] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => scrollY.set(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });

    const beamLoop = () => {
      const delay = 4000 + Math.random() * 6000;
      timerRef.current = setTimeout(() => {
        setBeam(true);
        setTimeout(() => { setBeam(false); beamLoop(); }, 1800);
      }, delay);
    };
    beamLoop();

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timerRef.current);
    };
  }, []);

  const y = useTransform(scrollY, [0, 3000], [20, 500]);
  const x = useTransform(scrollY, [0, 3000], [0, -40]);
  const springY = useSpring(y, { stiffness: 40, damping: 18 });
  const springX = useSpring(x, { stiffness: 40, damping: 18 });

  return (
    <>
      <motion.div
        className="fixed right-4 md:right-10 z-[60]"
        style={{ top: 0, y: springY, x: springX, width: '100px', height: '58px', cursor: 'pointer' }}
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 20 }}
        transition={{ delay: 2.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          onClick={() => setTerminal(true)}
          whileHover={{ scale: 1.1 }}
          title="Clique para interceptar sinal 👽"
        >
          <UFOSvg beamActive={beam} />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {terminal && <UFOTerminal onClose={() => setTerminal(false)} />}
      </AnimatePresence>
    </>
  );
}
