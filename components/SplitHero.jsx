'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import IsometricDesk from '@/components/IsometricDesk';
import Typewriter from '@/components/Typewriter';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const socialLinks = [
  { label: 'Email',     href: 'mailto:rafaelcroriz7@gmail.com',                      icon: <EmailIcon />,     neon: true  },
  { label: 'GitHub',    href: 'https://github.com/R4PTOR-C',                         icon: <GithubIcon />    },
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/rafael-caldas-76174b207', icon: <LinkedinIcon />  },
  { label: 'Instagram', href: 'https://instagram.com/rafaelroriz7',                  icon: <InstagramIcon /> },
];

/* ─────────────────────────────────────────────────────
   MOBILE HERO — tabs full-width
───────────────────────────────────────────────────── */
function MobileHero({ t, mounted }) {
  const [tab, setTab] = useState('front');
  const isFront = tab === 'front';

  const frontSkills = ['React', 'Next.js', 'Tailwind', 'HTML & CSS'];
  const backSkills  = ['Ruby on Rails', 'Node.js', 'PostgreSQL', 'REST API'];

  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      {/* bg */}
      <div className="absolute inset-0" style={{
        background: isFront
          ? 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(0,229,160,0.08) 0%, transparent 70%), #050b14'
          : 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(37,99,235,0.08) 0%, transparent 70%), #050b14',
        transition: 'background 0.4s ease',
      }} />
      {isFront
        ? <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,229,160,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        : <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(59,130,246,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      }

      {/* Name */}
      <motion.div
        className="relative z-10 pt-24 pb-4 text-center"
        initial={{ opacity: 0, y: -12 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="text-xl font-extrabold tracking-tight glitch-name">
          <Typewriter text="Rafael " delay={400} speed={90} className="text-text" />
          <Typewriter text="Caldas" delay={400 + 7 * 90} speed={90}
            style={{ backgroundImage: 'linear-gradient(90deg,#3b82f6,#00e5a0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
        </h1>
        <p className="text-[10px] font-mono text-dim tracking-[0.3em] uppercase mt-1">Full-Stack Developer</p>
      </motion.div>

      {/* Tab toggle */}
      <motion.div
        className="relative z-10 flex justify-center px-6 mb-6"
        initial={{ opacity: 0, y: -8 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex rounded-xl p-1 gap-1" style={{ background: 'rgba(12,26,46,0.8)', border: '1px solid #142238' }}>
          <button
            onClick={() => setTab('front')}
            className="px-5 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-250"
            style={isFront
              ? { background: 'rgba(0,229,160,0.12)', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.3)' }
              : { color: '#475569', border: '1px solid transparent' }
            }
          >
            &lt; front-end /&gt;
          </button>
          <button
            onClick={() => setTab('back')}
            className="px-5 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-250"
            style={!isFront
              ? { background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }
              : { color: '#475569', border: '1px solid transparent' }
            }
          >
            &#123; back-end &#125;
          </button>
        </div>
      </motion.div>

      {/* Panel content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 gap-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center gap-5 w-full"
          >
            {/* Illustration */}
            <div style={{ width: '260px', height: '205px' }}>
              <IsometricDesk side={tab} />
            </div>

            {/* Heading */}
            <div>
              {isFront ? (
                <>
                  <p className="font-mono text-[10px] tracking-[0.3em] text-neon mb-2 uppercase">&lt; front-end /&gt;</p>
                  <h2 className="text-3xl font-extrabold leading-none text-text">Interface <span style={{ color: '#00e5a0' }}>Crafter</span></h2>
                </>
              ) : (
                <>
                  <p className="font-mono text-[10px] tracking-[0.3em] text-blue-light mb-2 uppercase">&#123; back-end &#125;</p>
                  <h2 className="text-3xl font-extrabold leading-none text-text">Systems <span className="text-blue-light">Engineer</span></h2>
                </>
              )}
              <p className="text-muted text-sm leading-relaxed mt-3 max-w-[280px]">
                {t(isFront ? 'splitFrontDesc' : 'splitBackDesc')}
              </p>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {(isFront ? frontSkills : backSkills).map(s => (
                <span key={s} className="text-[11px] px-3 py-1.5 rounded-full font-mono"
                  style={isFront
                    ? { border: '1px solid rgba(0,229,160,0.2)', color: 'rgba(0,229,160,0.75)', background: 'rgba(0,229,160,0.05)' }
                    : { border: '1px solid rgba(59,130,246,0.2)', color: 'rgba(96,165,250,0.75)', background: 'rgba(37,99,235,0.05)' }
                  }
                >{s}</span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Social + CTA */}
      <motion.div
        className="relative z-10 pb-8 flex justify-center gap-3 pointer-events-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {socialLinks.map(link => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-dim"
            style={{ border: '1px solid #142238', background: 'rgba(12,26,46,0.8)' }}
          >
            {link.icon}
          </a>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   DESKTOP HERO — drag slider
───────────────────────────────────────────────────── */
function DesktopHero({ t, mounted }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const updatePos = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos(clamp(((clientX - rect.left) / rect.width) * 100, 12, 88));
  }, []);

  useEffect(() => {
    const onMove = (e) => { if (dragging) updatePos(e.clientX); };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, updatePos]);

  const frontness = clamp((pos - 12) / 76, 0, 1);
  const isFront = frontness >= 0.5;
  const frontSkills = ['React', 'Next.js', 'Tailwind', 'HTML & CSS'];
  const backSkills  = ['Ruby on Rails', 'Node.js', 'PostgreSQL', 'REST API'];

  return (
    <div
      ref={containerRef}
      className="relative h-screen overflow-hidden select-none"
      style={{ cursor: dragging ? 'col-resize' : 'default' }}
    >
      {/* LEFT PANEL */}
      <div className="absolute inset-0" style={{ clipPath: `polygon(0 0, ${pos}% 0, ${pos}% 100%, 0 100%)` }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 65% 70% at 20% 55%, rgba(0,229,160,0.09) 0%, transparent 65%), #050b14' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,229,160,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,0.025) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: '320px', height: '252px' }}>
          <IsometricDesk side="front" />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 left-16 max-w-xs">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={mounted ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <p className="font-mono text-[11px] tracking-[0.3em] text-neon mb-4 uppercase">&lt; front-end /&gt;</p>
            <h2 className="text-5xl font-extrabold leading-none text-text mb-2">Interface</h2>
            <h2 className="text-5xl font-extrabold leading-none mb-5" style={{ color: '#00e5a0' }}>Crafter</h2>
            <p className="text-muted text-sm leading-relaxed mb-6 max-w-[220px]">{t('splitFrontDesc')}</p>
            <div className="flex flex-wrap gap-2">
              {frontSkills.map(s => (
                <span key={s} className="text-[11px] px-2.5 py-1 rounded-full font-mono" style={{ border: '1px solid rgba(0,229,160,0.2)', color: 'rgba(0,229,160,0.75)', background: 'rgba(0,229,160,0.05)' }}>{s}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="absolute inset-0" style={{ clipPath: `polygon(${pos}% 0, 100% 0, 100% 100%, ${pos}% 100%)` }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 65% 70% at 80% 45%, rgba(37,99,235,0.09) 0%, transparent 65%), #050b14' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(59,130,246,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: '320px', height: '252px' }}>
          <IsometricDesk side="back" />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-16 max-w-xs text-right">
          <motion.div initial={{ opacity: 0, x: 24 }} animate={mounted ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <p className="font-mono text-[11px] tracking-[0.3em] text-blue-light mb-4 uppercase">&#123; back-end &#125;</p>
            <h2 className="text-5xl font-extrabold leading-none text-text mb-2">Systems</h2>
            <h2 className="text-5xl font-extrabold leading-none mb-5 text-blue-light">Engineer</h2>
            <p className="text-muted text-sm leading-relaxed mb-6 max-w-[220px] ml-auto">{t('splitBackDesc')}</p>
            <div className="flex flex-wrap gap-2 justify-end">
              {backSkills.map(s => (
                <span key={s} className="text-[11px] px-2.5 py-1 rounded-full font-mono" style={{ border: '1px solid rgba(59,130,246,0.2)', color: 'rgba(96,165,250,0.75)', background: 'rgba(37,99,235,0.05)' }}>{s}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* SLIDER */}
      <div
        className="absolute top-0 z-30 flex flex-col items-center"
        style={{ bottom: '6rem', left: `${pos}%`, transform: 'translateX(-50%)', width: '40px', cursor: 'col-resize' }}
        onMouseDown={(e) => { e.preventDefault(); setDragging(true); }}
      >
        <div className="w-px flex-1 mx-auto" style={{ background: `linear-gradient(to bottom, transparent, ${isFront ? 'rgba(0,229,160,0.35)' : 'rgba(59,130,246,0.35)'} 20%, ${isFront ? 'rgba(0,229,160,0.35)' : 'rgba(59,130,246,0.35)'} 80%, transparent)` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: `rgba(${isFront ? '0,229,160' : '59,130,246'},0.12)`, border: `1px solid rgba(${isFront ? '0,229,160' : '59,130,246'},0.45)`, backdropFilter: 'blur(10px)', boxShadow: `0 0 20px rgba(${isFront ? '0,229,160' : '59,130,246'},0.2)`, transition: 'all 0.4s' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white/60">
            <path d="M8 9l-4 3 4 3M16 9l4 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[9px] font-mono tracking-[0.2em] uppercase" style={{ color: `rgba(${isFront ? '0,229,160' : '59,130,246'},0.4)` }}>
            {t('splitDrag')}
          </span>
        </div>
      </div>

      {/* NAME */}
      <motion.div className="absolute top-20 inset-x-0 z-20 flex justify-center pointer-events-none" initial={{ opacity: 0, y: -16 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.5 }}>
        <div className="text-center px-6">
          <h1 className="text-2xl font-extrabold tracking-tight glitch-name">
            <Typewriter text="Rafael " delay={400} speed={90} className="text-text" />
            <Typewriter text="Caldas" delay={400 + 7 * 90} speed={90}
              style={{ backgroundImage: 'linear-gradient(90deg,#3b82f6,#00e5a0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
          </h1>
          <p className="text-[10px] font-mono text-dim tracking-[0.3em] uppercase mt-1">Full-Stack Developer</p>
        </div>
      </motion.div>

      {/* SOCIAL + CTA */}
      <motion.div className="absolute bottom-8 inset-x-0 z-40 flex justify-center gap-4 pointer-events-auto" initial={{ opacity: 0, y: 16 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.6 }}>
        <a href="mailto:rafaelcroriz7@gmail.com" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-bg transition-all duration-200 hover:-translate-y-0.5" style={{ background: '#00e5a0', boxShadow: '0 0 20px rgba(0,229,160,0.3)' }}>
          {t('heroCta')}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        {socialLinks.map(link => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-dim hover:text-text transition-all duration-200 hover:-translate-y-0.5"
            style={{ border: '1px solid #142238', background: 'rgba(12,26,46,0.8)', backdropFilter: 'blur(8px)' }}
          >
            {link.icon}
          </a>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   ROOT — escolhe layout por breakpoint
───────────────────────────────────────────────────── */
export default function SplitHero() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <MobileHero t={t} mounted={mounted} />
      </div>
      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopHero t={t} mounted={mounted} />
      </div>
    </>
  );
}
