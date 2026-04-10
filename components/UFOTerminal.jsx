'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LINES = [
  { text: 'INTERCEPTING SIGNAL...', color: '#00e5a0', delay: 0 },
  { text: 'TARGET IDENTIFIED: rafaelcaldas.dev', color: '#60a5fa', delay: 500 },
  { text: 'SCANNING SKILL TREE...', color: '#475569', delay: 1100 },
  { text: '  > React / Next.js [████████░░] 87%', color: '#a78bfa', delay: 1700 },
  { text: '  > Node.js         [████████░░] 83%', color: '#a78bfa', delay: 2300 },
  { text: '  > PostgreSQL      [████████░░] 85%', color: '#a78bfa', delay: 2600 },
  { text: '  > Python          [███████░░░] 78%', color: '#a78bfa', delay: 2900 },
  { text: '  > Coffee intake   [██████████] 100%', color: '#febc2e', delay: 3300 },
  { text: 'THREAT LEVEL: FULL-STACK ⚡', color: '#00e5a0', delay: 3900 },
  { text: 'ABDUCTION ATTEMPT... FAILED (too skilled)', color: '#ff5f57', delay: 4500 },
  { text: 'RETREATING. WILL RETURN. 👽', color: '#00e5a0', delay: 5100 },
];

export default function UFOTerminal({ onClose }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    setLines([]);
    const timers = LINES.map(({ text, color, delay }) =>
      setTimeout(() => setLines(prev => [...prev, { text, color }]), delay)
    );
    return () => { timers.forEach(clearTimeout); setLines([]); };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9995] flex items-center justify-center p-6 cursor-auto"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(0,229,160,0.25)', background: '#040c16' }}
        initial={{ scale: 0.85, y: -40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: -40 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#142238] bg-[#060e18]">
          <span className="text-lg">🛸</span>
          <span className="text-xs font-mono text-dim tracking-wider flex-1">ufo-transmission — intercepted</span>
          <button onClick={onClose} className="text-dim hover:text-red-400 transition-colors text-xs font-mono">✕ close</button>
        </div>

        {/* Terminal body */}
        <div className="p-5 font-mono text-sm min-h-[260px] space-y-1.5">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{ color: line.color }}
              className="leading-6"
            >
              {line.text}
            </motion.p>
          ))}
          {lines.length < LINES.length && (
            <span className="inline-block w-2 h-4 align-middle animate-pulse" style={{ background: '#00e5a0' }} />
          )}
        </div>

        <div className="px-5 pb-4 text-[10px] font-mono text-dim/50 text-right">
          click anywhere to dismiss
        </div>
      </motion.div>
    </motion.div>
  );
}
