'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  { text: 'Initializing runtime...', color: '#475569' },
  { text: 'Loading modules → React · Rails · Node', color: '#60a5fa' },
  { text: 'Connecting to PostgreSQL...', color: '#475569' },
  { text: 'Building interfaces...', color: '#a78bfa' },
  { text: 'rafael-caldas@portfolio:~$ ready ✓', color: '#00e5a0' },
];

export default function LoadingScreen() {
  const [visible, setVisible]   = useState(false);
  const [lines,   setLines]     = useState([]);
  const [progress, setProgress] = useState(0);
  const [exiting,  setExiting]  = useState(false);

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rc_loaded')) return;
    setVisible(true);

    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
      }, 300 + i * 380);
    });

    const total = 300 + BOOT_LINES.length * 380 + 400;
    setTimeout(() => setExiting(true), total);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('rc_loaded', '1');
    }, total + 700);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#050b14' }}
          animate={exiting ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Grid bg */}
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,229,160,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Glow blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(0,229,160,0.06)' }} />

          {/* Terminal card */}
          <motion.div
            className="relative w-full max-w-md mx-6 rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(0,229,160,0.15)', background: 'rgba(8,20,34,0.95)' }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#142238]">
              <span className="w-3 h-3 rounded-full bg-red-400/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <span className="w-3 h-3 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs font-mono text-dim tracking-wider">portfolio — bash</span>
            </div>

            {/* Terminal body */}
            <div className="px-5 py-5 font-mono text-sm min-h-[180px]">
              {lines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="leading-7"
                  style={{ color: line.color }}
                >
                  {line.text}
                </motion.p>
              ))}
              {lines.length < BOOT_LINES.length && (
                <span className="inline-block w-2 h-4 ml-0.5 align-middle animate-pulse" style={{ background: '#00e5a0' }} />
              )}
            </div>

            {/* Progress bar */}
            <div className="px-5 pb-5">
              <div className="w-full h-1 rounded-full" style={{ background: 'rgba(0,229,160,0.1)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #3b82f6, #00e5a0)' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] font-mono text-dim">loading</span>
                <span className="text-[10px] font-mono" style={{ color: '#00e5a0' }}>{progress}%</span>
              </div>
            </div>
          </motion.div>

          {/* Name below */}
          <motion.p
            className="mt-6 text-xs font-mono tracking-[0.4em] uppercase text-dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Rafael Caldas · Portfolio
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
