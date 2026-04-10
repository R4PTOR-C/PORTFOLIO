'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          exit={{    opacity: 0, scale: 0.7,  y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-6 z-50 w-11 h-11 rounded-xl flex items-center justify-center group transition-all duration-200 hover:-translate-y-1"
          style={{
            background: 'rgba(8,20,34,0.9)',
            border: '1px solid rgba(0,229,160,0.25)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 20px rgba(0,229,160,0.1)',
          }}
          aria-label="Voltar ao topo"
        >
          <motion.svg
            viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,160,0.8)"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="w-4 h-4"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </motion.svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
