'use client';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import FadeIn from '@/components/FadeIn';

function AnimatedCounter({ to, suffix = '', duration = 1600 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(ease * to));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function About() {
  const { t } = useTranslation();

  const stats = [
    { count: 4,    suffix: '+', labelKey: 'statYears',     accent: '#00e5a0' },
    { count: 2,    suffix: '',  labelKey: 'statCompanies', accent: '#3b82f6' },
    { count: null, text: 'PT·EN', labelKey: 'statLanguages', accent: '#a78bfa' },
    { count: 2026, suffix: '',  labelKey: 'statDegree',    accent: '#00e5a0' },
  ];

  return (
    <section id="about" className="py-20 md:py-28 px-6 border-t border-border-dim">
      <div className="max-w-6xl mx-auto">

        <FadeIn>
          <div className="section-tag mb-10">{t('aboutTitle')}</div>
        </FadeIn>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 auto-rows-auto">

          {/* ── BIO — wide card ── */}
          <FadeIn delay={0.05} className="col-span-2 md:col-span-3 card rounded-3xl p-8 flex flex-col justify-between min-h-[220px]"
            style={{ background: 'linear-gradient(135deg, rgba(12,26,46,0.95) 0%, rgba(5,11,20,0.95) 100%)' }}
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-5 leading-snug"
                style={{ backgroundImage: 'linear-gradient(90deg,#3b82f6,#00e5a0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {t('aboutHeadline')}
              </h2>
              <p className="text-muted text-sm md:text-base leading-relaxed">
                {t('aboutText')}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon pulse-dot" />
              <span className="text-[11px] font-mono text-neon/70 tracking-widest uppercase">{t('aboutStatus')}</span>
            </div>
          </FadeIn>

          {/* ── PROFILE CARD ── */}
          <FadeIn delay={0.1} className="col-span-2 md:col-span-2 card rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,229,160,0.07) 0%, transparent 70%)' }} />

            <svg width="0" height="0" className="absolute">
              <defs>
                <clipPath id="hexClip" clipPathUnits="objectBoundingBox">
                  <path d="M 0.136,0.24 L 0.457,0.055 Q 0.5,0.03 0.543,0.055 L 0.864,0.24 Q 0.907,0.265 0.907,0.315 L 0.907,0.685 Q 0.907,0.735 0.864,0.76 L 0.543,0.945 Q 0.5,0.97 0.457,0.945 L 0.136,0.76 Q 0.093,0.735 0.093,0.685 L 0.093,0.315 Q 0.093,0.265 0.136,0.24 Z" />
                </clipPath>
              </defs>
            </svg>

            {/* Hexagonal avatar frame */}
            <div className="relative w-56 h-56">
              {/* glow ring behind */}
              <div className="absolute inset-0 scale-110" style={{ clipPath: 'url(#hexClip)', background: 'linear-gradient(135deg,rgba(0,229,160,0.35),rgba(59,130,246,0.35))' }} />
              {/* inner border */}
              <div className="absolute inset-[2px]" style={{ clipPath: 'url(#hexClip)', background: 'rgba(0,229,160,0.08)' }} />
              {/* photo */}
              <div className="absolute inset-[3px] overflow-hidden" style={{ clipPath: 'url(#hexClip)' }}>
                <img src="/perfil.jpeg" alt="Rafael Caldas" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <p className="text-text font-bold text-base">Rafael Caldas</p>
              <p className="text-dim text-[11px] font-mono tracking-widest uppercase mt-0.5">Full-Stack Dev</p>
            </div>
            <div className="w-full border-t border-border-dim pt-4 flex flex-col gap-2.5">
              {[
                { icon: '◎', label: 'Goiânia, Brasil' },
                { icon: '◎', label: 'rafaelcroriz7@gmail.com' },
                { icon: '◎', label: 'PT · EN' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-muted">
                  <span className="neon-text text-[10px]">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </FadeIn>

          {/* ── STAT CARDS (4×) ── */}
          {stats.map((s, i) => (
            <FadeIn key={s.labelKey} delay={0.15 + i * 0.05} className="col-span-1 card rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-1.5 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl" style={{ background: s.accent, opacity: 0.5 }} />
              <span className="text-3xl font-extrabold" style={{ color: s.accent }}>
                {s.count !== null
                  ? <AnimatedCounter to={s.count} suffix={s.suffix} duration={s.count > 100 ? 2000 : 1200} />
                  : s.text}
              </span>
              <span className="text-[10px] text-dim font-mono tracking-wider uppercase leading-snug">{t(s.labelKey)}</span>
            </FadeIn>
          ))}

          {/* ── CURRENTLY AT ── */}
          <FadeIn delay={0.35} className="col-span-2 md:col-span-3 card rounded-2xl px-6 py-5 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 100% at 0% 50%, rgba(59,130,246,0.07) 0%, transparent 70%)' }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(59,130,246,0.8)" strokeWidth="1.8" className="w-5 h-5">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-mono text-dim tracking-widest uppercase mb-0.5">{t('aboutCurrently')}</p>
              <p className="text-text text-sm font-semibold">{t('exp2Company')}</p>
              <p className="text-dim text-xs mt-0.5">{t('exp2Role')} · {t('exp2Period')}</p>
            </div>
            <div className="ml-auto hidden md:flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-light pulse-dot" />
              <span className="text-[10px] font-mono text-blue-light/60 tracking-wider">{t('aboutActive')}</span>
            </div>
          </FadeIn>

          {/* ── CTA ── */}
          <FadeIn delay={0.4} className="col-span-2 md:col-span-2 rounded-2xl p-px overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(0,229,160,0.3), rgba(59,130,246,0.3))' }}
          >
            <a
              href="mailto:rafaelcroriz7@gmail.com"
              className="w-full h-full card rounded-2xl px-6 py-5 flex items-center justify-between gap-4 group transition-all duration-200 hover:bg-[rgba(12,26,46,0.7)]"
              style={{ display: 'flex' }}
            >
              <div>
                <p className="text-[10px] font-mono text-dim tracking-widest uppercase mb-0.5">{t('aboutContact')}</p>
                <p className="text-text text-sm font-semibold">rafaelcroriz7@gmail.com</p>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,160,0.8)" strokeWidth="2" className="w-4 h-4">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </a>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
