'use client';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import FadeIn from '@/components/FadeIn';

const SWEEP_DURATION = 3; // seconds per full rotation

const BLIPS = [
  { angle: 38,  r: 62, label: 'React',    color: '#00e5a0' },
  { angle: 84,  r: 40, label: 'Next.js',  color: '#60a5fa' },
  { angle: 150, r: 66, label: 'Node.js',  color: '#00e5a0' },
  { angle: 200, r: 36, label: 'Tailwind', color: '#a78bfa' },
  { angle: 258, r: 58, label: 'PostgreSQL',color: '#60a5fa' },
  { angle: 314, r: 44, label: 'Python',   color: '#00e5a0' },
];

function toXY(angle, r, cx = 100, cy = 100) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function ProfileAvatar() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="radarBg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#0d1f36" />
          <stop offset="100%" stopColor="#050b14" />
        </radialGradient>
        <filter id="blipGlow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="centerGlow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="rcGradR" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#00e5a0" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="200" height="200" fill="url(#radarBg)" />

      {/* Crosshairs */}
      <line x1="100" y1="16" x2="100" y2="184" stroke="rgba(0,229,160,0.06)" strokeWidth="0.6" />
      <line x1="16" y1="100" x2="184" y2="100" stroke="rgba(0,229,160,0.06)" strokeWidth="0.6" />

      {/* Radar rings */}
      {[30, 50, 70].map((r, i) => (
        <circle key={i} cx="100" cy="100" r={r}
          fill="none" stroke="rgba(0,229,160,0.09)" strokeWidth="0.7" />
      ))}

      {/* Sweep fan — CSS keyframe avoids SVG/CSS transform conflict */}
      <g className="radar-sweep">
        {Array.from({ length: 22 }, (_, i) => {
          // Calculate absolute endpoint for each trail line
          // i=0 is leading edge (pointing up), i>0 trails behind (negative angle = CCW offset)
          const rad = (-i * 4 * Math.PI) / 180;
          const R = 71;
          const x2 = 100 + R * Math.sin(rad);
          const y2 = 100 - R * Math.cos(rad);
          const isLeading = i === 0;
          return (
            <line key={i}
              x1="100" y1="100" x2={x2} y2={y2}
              stroke="#00e5a0"
              strokeWidth={isLeading ? 1.5 : 0.6}
              opacity={isLeading ? 0.75 : Math.pow((22 - i) / 22, 2) * 0.22}
            />
          );
        })}
        {/* Leading edge glow dot — at tip of i=0 line (up direction before rotation) */}
        <circle cx="100" cy="29" r="2.5" fill="#00e5a0" opacity="0.9" />
      </g>

      {/* Blips */}
      {BLIPS.map((blip) => {
        const { x, y } = toXY(blip.angle, blip.r);
        const delay = (blip.angle / 360) * SWEEP_DURATION;
        const labelRight = x > 100;
        return (
          <g key={blip.label}>
            {/* Pulse ring — animate r directly, no transform needed */}
            <motion.circle
              cx={x} cy={y}
              fill="none" stroke={blip.color} strokeWidth="0.8"
              animate={{ r: [3, 12], opacity: [0.6, 0] }}
              transition={{ duration: SWEEP_DURATION, delay, repeat: Infinity, ease: 'easeOut', times: [0, 0.7] }}
            />
            {/* Blip dot */}
            <motion.circle
              cx={x} cy={y} r={2.8}
              fill={blip.color}
              filter="url(#blipGlow)"
              animate={{ opacity: [0, 1, 0.9, 0.2, 0] }}
              transition={{ duration: SWEEP_DURATION, delay, repeat: Infinity, ease: 'easeOut', times: [0, 0.04, 0.2, 0.6, 1] }}
            />
            {/* Label */}
            <motion.text
              x={labelRight ? x + 6 : x - 6} y={y + 1.5}
              textAnchor={labelRight ? 'start' : 'end'}
              fontFamily="monospace" fontSize="6.5" fill={blip.color}
              animate={{ opacity: [0, 0.9, 0.9, 0, 0] }}
              transition={{ duration: SWEEP_DURATION, delay, repeat: Infinity, ease: 'easeOut', times: [0, 0.05, 0.35, 0.65, 1] }}
            >
              {blip.label}
            </motion.text>
          </g>
        );
      })}

      {/* Center disc */}
      <circle cx="100" cy="100" r="24"
        fill="rgba(5,11,20,0.85)" stroke="rgba(0,229,160,0.22)" strokeWidth="1" />

      {/* RC monogram */}
      <text x="100" y="107"
        textAnchor="middle" fontFamily="monospace"
        fontSize="20" fontWeight="900"
        fill="url(#rcGradR)" filter="url(#centerGlow)"
        letterSpacing="-0.5"
      >RC</text>

      {/* SCANNING label */}
      <motion.text
        x="162" y="193"
        fontFamily="monospace" fontSize="5.5"
        fill="rgba(0,229,160,0.35)"
        animate={{ opacity: [0.35, 0.1, 0.35] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >SCANNING...</motion.text>
    </svg>
  );
}

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
            style={{
              background: 'linear-gradient(135deg, rgba(12,26,46,0.95) 0%, rgba(5,11,20,0.95) 100%)',
            }}
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-text mb-5 leading-snug">
                Construo sistemas do<br />
                <span style={{ backgroundImage: 'linear-gradient(90deg,#3b82f6,#00e5a0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  banco ao browser.
                </span>
              </h2>
              <p className="text-muted text-sm md:text-base leading-relaxed">
                {t('aboutText')}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon pulse-dot" />
              <span className="text-[11px] font-mono text-neon/70 tracking-widest uppercase">Open to opportunities</span>
            </div>
          </FadeIn>

          {/* ── PROFILE CARD ── */}
          <FadeIn delay={0.1} className="col-span-2 md:col-span-2 card rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
            {/* bg glow */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,229,160,0.07) 0%, transparent 70%)' }} />

            {/* SVG clipPath definition */}
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
              {/* placeholder */}
              <div className="absolute inset-[3px] overflow-hidden" style={{ clipPath: 'url(#hexClip)' }}>
                <ProfileAvatar />
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
          {[
            { count: 4,    suffix: '+',   label: 'Anos de experiência', accent: '#00e5a0' },
            { count: 2,    suffix: '',    label: 'Empresas',            accent: '#3b82f6' },
            { count: null, text: 'PT·EN', label: 'Idiomas',             accent: '#a78bfa' },
            { count: 2026, suffix: '',    label: 'Formação',            accent: '#00e5a0' },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={0.15 + i * 0.05} className="col-span-1 card rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-1.5 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl" style={{ background: s.accent, opacity: 0.5 }} />
              <span className="text-3xl font-extrabold" style={{ color: s.accent }}>
                {s.count !== null
                  ? <AnimatedCounter to={s.count} suffix={s.suffix} duration={s.count > 100 ? 2000 : 1200} />
                  : s.text}
              </span>
              <span className="text-[10px] text-dim font-mono tracking-wider uppercase leading-snug">{s.label}</span>
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
              <p className="text-[10px] font-mono text-dim tracking-widest uppercase mb-0.5">Currently at</p>
              <p className="text-text text-sm font-semibold">Assembleia Legislativa do Estado de Goiás</p>
              <p className="text-dim text-xs mt-0.5">Junior Software Engineer · 2023 – Presente</p>
            </div>
            <div className="ml-auto hidden md:flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-light pulse-dot" />
              <span className="text-[10px] font-mono text-blue-light/60 tracking-wider">ATIVO</span>
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
                <p className="text-[10px] font-mono text-dim tracking-widest uppercase mb-0.5">Vamos conversar</p>
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
