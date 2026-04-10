'use client';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { key: 'navAbout',      href: '#about'      },
  { key: 'navSkills',     href: '#skills'     },
  { key: 'navExperience', href: '#experience' },
  { key: 'navEducation',  href: '#education'  },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [scrolled,  setScrolled]  = useState(false);
  const [hidden,    setHidden]    = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      if (y < 80) { setHidden(false); }
      else if (y > lastY.current + 6)  setHidden(true);
      else if (y < lastY.current - 6)  setHidden(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleLang = () => {
    const next = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(next);
    localStorage.setItem('i18nextLng', next);
  };

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: hidden ? -80 : 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className={`transition-all duration-300 ${
        scrolled
          ? 'bg-bg/80 backdrop-blur-xl border-b border-border shadow-lg shadow-black/30'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          <a
            href="#"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 font-bold text-lg text-text tracking-tight"
          >
            <span className="text-blue-mid">Rafael</span>
            <span className="neon-text text-sm">•</span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a key={link.key} href={link.href}
                className="relative text-sm text-muted hover:text-text transition-colors duration-200 group py-1"
              >
                {t(link.key)}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-neon group-hover:w-full transition-all duration-300 shadow-[0_0_6px_rgba(0,229,160,0.6)]" />
              </a>
            ))}
            <button onClick={toggleLang}
              className="ml-2 text-xs font-mono font-semibold px-3 py-1.5 rounded border border-border text-muted hover:text-neon hover:border-neon/40 transition-all duration-200"
            >
              {i18n.language === 'pt' ? 'EN' : 'PT'}
            </button>
          </nav>

          <div className="flex md:hidden items-center gap-3">
            <button onClick={toggleLang}
              className="text-xs font-mono px-2.5 py-1 rounded border border-border text-muted hover:text-neon hover:border-neon/40 transition-all duration-200"
            >
              {i18n.language === 'pt' ? 'EN' : 'PT'}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-muted hover:text-neon transition-colors p-1">
              <div className="w-5 flex flex-col gap-1.5">
                <motion.span animate={menuOpen ? { rotate: 45, y: 6 }  : { rotate: 0, y: 0 }}  className="block h-px bg-current origin-center" />
                <motion.span animate={menuOpen ? { opacity: 0 }        : { opacity: 1 }}        className="block h-px bg-current" />
                <motion.span animate={menuOpen ? { rotate: -45, y: -6 }: { rotate: 0, y: 0 }}  className="block h-px bg-current origin-center" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-surface/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="flex flex-col px-6 py-5 gap-4">
              {navLinks.map((link) => (
                <a key={link.key} href={link.href} onClick={() => setMenuOpen(false)}
                  className="text-sm text-muted hover:text-neon transition-colors py-1"
                >
                  {t(link.key)}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
