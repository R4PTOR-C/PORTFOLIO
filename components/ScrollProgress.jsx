'use client';
import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const [pct, setPct] = useState(0);
  const spring = useSpring(0, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement;
      const val = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      spring.set(val);
      setPct(val);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [spring]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9998] h-[2px] origin-left"
      style={{
        scaleX: spring.get() / 100,
        width: '100%',
        background: 'linear-gradient(90deg, #3b82f6, #00e5a0)',
        boxShadow: '0 0 8px rgba(0,229,160,0.6)',
        scaleX: pct / 100,
        transformOrigin: 'left',
      }}
    />
  );
}
