'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { key: 'navAbout',    id: 'about'      },
  { key: 'navFenrys',   id: 'fenrys'     },
  { key: 'navProjects', id: 'projects'   },
  { key: 'navStack',    id: 'skills'     },
  { key: 'navLog',      id: 'experience' },
  { key: 'navContact',  id: 'contact'    },
];

/* A floating HUD pill instead of a full-width bar. The active section gets a
   neon capsule that slides between links (shared layoutId), so the nav shows
   where you are without a second indicator. */
export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const els = navLinks.map((l) => document.getElementById(l.id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
    }, { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const toggleLang = () => {
    const next = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(next);
    localStorage.setItem('i18nextLng', next);
  };
  const langLabel = i18n.language === 'pt' ? 'EN' : 'PT';

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-3 md:top-5 inset-x-0 z-50 flex justify-center px-3 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-bg/70 backdrop-blur-xl pl-2 pr-1.5 py-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          aria-label="Rafael Caldas, topo"
          className="display glitch grid place-items-center w-9 h-9 rounded-full bg-surface text-neon text-sm"
        >
          R
        </a>

        <nav className="hidden md:flex items-center" aria-label="Principal">
          {navLinks.map((link) => (
            <a
              key={link.key}
              href={`#${link.id}`}
              className={`relative px-4 py-2 text-[13px] rounded-full transition-colors duration-200 ${
                active === link.id ? 'text-bg' : 'text-muted hover:text-text'
              }`}
            >
              {active === link.id && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-neon"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{t(link.key)}</span>
            </a>
          ))}
        </nav>

        <button
          onClick={toggleLang}
          aria-label={`Switch language to ${langLabel}`}
          className="ml-1 font-mono text-[11px] font-semibold w-9 h-9 rounded-full border border-border text-muted hover:text-neon hover:border-neon/40 transition-colors"
        >
          {langLabel}
        </button>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          className="md:hidden w-9 h-9 grid place-items-center rounded-full text-muted hover:text-neon"
        >
          <div className="w-4 flex flex-col gap-1.5">
            <motion.span animate={menuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} className="block h-px bg-current" />
            <motion.span animate={menuOpen ? { rotate: -45, y: -3 } : { rotate: 0, y: 0 }} className="block h-px bg-current" />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Principal (mobile)"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto md:hidden absolute top-14 inset-x-3 rounded-3xl border border-border bg-surface/95 backdrop-blur-xl p-3 flex flex-col"
          >
            {navLinks.map((link, i) => (
              <a
                key={link.key}
                href={`#${link.id}`}
                onClick={() => setMenuOpen(false)}
                className="display flex items-baseline gap-3 px-3 py-3 text-xl text-text hover:text-neon"
              >
                <span className="font-mono text-xs text-dim">0{i + 1}</span>
                {t(link.key)}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
