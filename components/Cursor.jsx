'use client';
import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function Cursor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [variant, setVariant]     = useState('default'); // default | hover | click
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { stiffness: 500, damping: 40 });
  const y = useSpring(rawY, { stiffness: 500, damping: 40 });
  // Trail lags more
  const tx = useSpring(rawX, { stiffness: 120, damping: 22 });
  const ty = useSpring(rawY, { stiffness: 120, damping: 22 });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setIsDesktop(true);

    const onMove = (e) => { rawX.set(e.clientX); rawY.set(e.clientY); };
    const onDown = () => setVariant('click');
    const onUp   = () => setVariant('default');

    const onEnter = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) setVariant('hover');
    };
    const onLeave = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) setVariant('default');
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);
    document.addEventListener('mouseover',  onEnter);
    document.addEventListener('mouseout',   onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      document.removeEventListener('mouseover',  onEnter);
      document.removeEventListener('mouseout',   onLeave);
    };
  }, []);

  if (!isDesktop) return null;

  const dotSize   = variant === 'hover' ? 44 : variant === 'click' ? 10 : 10;
  const dotColor  = variant === 'hover' ? 'rgba(0,229,160,0.15)' : 'rgba(0,229,160,0.8)';
  const dotBorder = variant === 'hover' ? '1.5px solid rgba(0,229,160,0.6)' : 'none';

  return (
    <>
      {/* Trail ring */}
      <motion.div
        className="fixed pointer-events-none z-[99999] rounded-full"
        style={{
          x: tx, y: ty,
          width: 32, height: 32,
          marginLeft: -16, marginTop: -16,
          border: '1px solid rgba(0,229,160,0.18)',
        }}
      />

      {/* Main cursor dot */}
      <motion.div
        className="fixed pointer-events-none z-[99999] rounded-full"
        style={{ x, y }}
        animate={{
          width: dotSize,
          height: dotSize,
          marginLeft: -dotSize / 2,
          marginTop: -dotSize / 2,
          background: dotColor,
          border: dotBorder,
          backdropFilter: variant === 'hover' ? 'blur(4px)' : 'none',
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      />
    </>
  );
}
