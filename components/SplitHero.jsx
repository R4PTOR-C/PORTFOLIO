'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import IsometricDesk from '@/components/IsometricDesk';
import Typewriter from '@/components/Typewriter';
import { socialLinks } from '@/lib/socialLinks';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

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
        className="relative z-10 pt-16 pb-3 text-center"
        initial={{ opacity: 0, y: -12 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="text-2xl font-extrabold tracking-tight glitch-name">
          <Typewriter text="Rafael " delay={400} speed={80} className="text-text" />
          <Typewriter text="Caldas" delay={400 + 7 * 80} speed={80}
            style={{ backgroundImage: 'linear-gradient(90deg,#3b82f6,#00e5a0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
        </h1>
        <p className="text-[10px] font-mono text-dim tracking-[0.3em] uppercase mt-1">Full-Stack Developer</p>
      </motion.div>

      {/* Tab toggle */}
      <motion.div
        className="relative z-10 flex justify-center px-6 mb-3"
        initial={{ opacity: 0, y: -8 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex rounded-xl p-1 gap-1" style={{ background: 'rgba(12,26,46,0.8)', border: '1px solid #142238' }}>
          <button
            onClick={() => setTab('front')}
            className="px-4 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-wider transition-all duration-250"
            style={isFront
              ? { background: 'rgba(0,229,160,0.12)', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.3)' }
              : { color: '#475569', border: '1px solid transparent' }
            }
          >
            &lt; front-end /&gt;
          </button>
          <button
            onClick={() => setTab('back')}
            className="px-4 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-wider transition-all duration-250"
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
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center gap-4 w-full"
          >
            {/* Illustration */}
            <div style={{ width: '220px', height: '174px' }}>
              <IsometricDesk side={tab} />
            </div>

            {/* Heading */}
            <div>
              {isFront ? (
                <>
                  <p className="font-mono text-[10px] tracking-[0.3em] text-neon mb-1.5 uppercase">&lt; front-end /&gt;</p>
                  <h2 className="text-2xl font-extrabold leading-none text-text">Interface <span style={{ color: '#00e5a0' }}>Crafter</span></h2>
                </>
              ) : (
                <>
                  <p className="font-mono text-[10px] tracking-[0.3em] text-blue-light mb-1.5 uppercase">&#123; back-end &#125;</p>
                  <h2 className="text-2xl font-extrabold leading-none text-text">Systems <span className="text-blue-light">Engineer</span></h2>
                </>
              )}
              <p className="text-muted text-xs leading-relaxed mt-2 max-w-[260px]">
                {t(isFront ? 'splitFrontDesc' : 'splitBackDesc')}
              </p>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {(isFront ? frontSkills : backSkills).map(s => (
                <span key={s} className="text-[10px] px-2.5 py-1 rounded-full font-mono"
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

      {/* Social icons */}
      <motion.div
        className="relative z-10 pb-8 flex justify-center gap-3 pointer-events-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {socialLinks.map(link => (
          <a
            key={link.label}
            href={link.href}
            target={link.label === 'Email' ? undefined : '_blank'}
            rel="noopener noreferrer"
            aria-label={link.label}
            className="w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95"
            style={link.neon
              ? { background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)', color: '#00e5a0', boxShadow: '0 0 12px rgba(0,229,160,0.15)' }
              : { border: '1px solid #142238', background: 'rgba(12,26,46,0.8)', color: '#475569' }
            }
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
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap flex flex-col items-center gap-1.5">
          <motion.svg
            viewBox="0 0 20 10" fill="none" stroke="currentColor" strokeWidth="1.5"
            className="w-5 h-2.5"
            style={{ color: `rgba(${isFront ? '0,229,160' : '59,130,246'},0.55)` }}
            animate={{ x: [-3, 3, -3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M1 5h4M15 5h4M7 1l-4 4 4 4M13 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase" style={{ color: `rgba(${isFront ? '0,229,160' : '59,130,246'},0.55)` }}>
            {t('splitDrag')}
          </span>
        </div>
      </div>

      {/* NAME */}
      <motion.div className="absolute top-20 inset-x-0 z-20 flex justify-center pointer-events-none" initial={{ opacity: 0, y: -16 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.5 }}>
        <div className="text-center px-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight glitch-name">
            <Typewriter text="Rafael " delay={400} speed={90} className="text-text" />
            <Typewriter text="Caldas" delay={400 + 7 * 90} speed={90}
              style={{ backgroundImage: 'linear-gradient(90deg,#3b82f6,#00e5a0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
          </h1>
          <p className="text-[11px] font-mono text-dim tracking-[0.3em] uppercase mt-1.5">Full-Stack Developer</p>
        </div>
      </motion.div>

      {/* SOCIAL + CTA */}
      <motion.div className="absolute bottom-8 inset-x-0 z-40 flex justify-center gap-3 pointer-events-auto" initial={{ opacity: 0, y: 16 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.6 }}>
        {socialLinks.map(link => (
          <a
            key={link.label}
            href={link.href}
            target={link.label === 'Email' ? undefined : '_blank'}
            rel="noopener noreferrer"
            aria-label={link.label}
            className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:-translate-y-0.5"
            style={link.neon
              ? { background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)', color: '#00e5a0', boxShadow: '0 0 14px rgba(0,229,160,0.18)' }
              : { border: '1px solid #142238', background: 'rgba(12,26,46,0.8)', backdropFilter: 'blur(8px)', color: '#475569' }
            }
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
