'use client';
import { useRef, useSyncExternalStore } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const STRAP = 150;   // resting strap length on desktop, px
const STRAP_SM = 70;

/* A crew ID hanging from a lanyard. Drag it and it snaps back on a spring;
   hover it and it tilts toward the pointer while a holographic foil slides
   across. The strap is redrawn from the card's live offset so it always
   reaches the clip. */
const MQ = '(min-width: 1024px)';
const subscribe = (cb) => {
  const m = window.matchMedia(MQ);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};

export default function CrewBadge() {
  const { t } = useTranslation();
  /* server renders the desktop strap; phones switch right after hydration */
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia(MQ).matches, () => true);
  const strap = wide ? STRAP : STRAP_SM;
  const reduce = useReducedMotion();
  const cardRef = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const swing = useSpring(useTransform(x, [-240, 240], [-28, 28]), { stiffness: 120, damping: 9 });

  /* tilt + foil from the pointer position inside the card */
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [10, -10]), { stiffness: 160, damping: 16 });
  const ry = useSpring(useTransform(px, [0, 1], [-14, 14]), { stiffness: 160, damping: 16 });
  const foil = useTransform([px, py], ([a, b]) => `${a * 100}% ${b * 100}%`);

  /* strap: from the anchor (0,0) to the clip at (x, STRAP + y) */
  const strapLen = useTransform([x, y], ([a, b]) => Math.hypot(a, strap + b));
  const strapRot = useTransform([x, y], ([a, b]) => (-Math.atan2(a, strap + b) * 180) / Math.PI);

  const onMove = (e) => {
    const r = cardRef.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); };

  return (
    <div className="relative w-[300px] mx-auto select-none" style={{ perspective: 900, height: strap + 420 }}>
      {/* strap */}
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-0 w-[14px] -ml-[7px] origin-top"
        style={{
          height: strapLen,
          rotate: strapRot,
          background: 'repeating-linear-gradient(180deg, #00e5a0 0 10px, #050b14 10px 13px)',
          boxShadow: '0 0 18px rgba(0,229,160,0.35)',
          opacity: 0.85,
        }}
      />

      <motion.div
        drag={!reduce}
        dragSnapToOrigin
        dragElastic={0.55}
        dragTransition={{ bounceStiffness: 260, bounceDamping: 11 }}
        whileDrag={{ cursor: 'grabbing', scale: 1.03 }}
        className="absolute left-1/2 -ml-[140px] w-[280px] cursor-grab touch-none"
        style={{ x, y, top: strap, rotate: swing, transformOrigin: '50% 0%' }}
        initial={reduce ? false : { y: -420, rotate: -12 }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 11, delay: 0.9 }}
      >
        {/* clip */}
        <div className="mx-auto -mb-2 relative z-10 w-14 h-6 rounded-md border border-border bg-surface flex items-center justify-center">
          <div className="w-7 h-1.5 rounded-full bg-bg" />
        </div>

        <motion.div
          ref={cardRef}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="group/card relative rounded-[22px] border border-border bg-[#0b1626] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]"
          style={{ rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry, transformStyle: 'preserve-3d' }}
        >
          <div className="flex items-center justify-between px-5 pt-5">
            <span className="display text-[11px] tracking-[0.2em] uppercase text-neon">{t('badgeTitle')}</span>
            <span className="font-mono text-[10px] text-dim">RC·001</span>
          </div>

          <div className="mx-5 mt-4 relative aspect-[4/4.2] overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/perfil.jpg"
              alt="Rafael Caldas"
              width={1024}
              height={1536}
              draggable={false}
              className="w-full h-full object-cover object-[50%_14%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(5,11,20,0.7))]" />
          </div>

          <div className="px-5 pt-4">
            <p className="display text-xl leading-none text-text">Rafael<br />Caldas</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 font-mono text-[10px] uppercase tracking-wider">
              <div><dt className="text-dim">{t('badgeRoleLabel')}</dt><dd className="text-muted mt-0.5">{t('heroRole')}</dd></div>
              <div><dt className="text-dim">{t('badgeBaseLabel')}</dt><dd className="text-muted mt-0.5">{t('badgeBase')}</dd></div>
              <div className="col-span-2"><dt className="text-dim">{t('badgeClearLabel')}</dt><dd className="text-neon mt-0.5">{t('badgeClear')}</dd></div>
            </dl>
          </div>

          <div className="mt-4 px-5 pb-5 flex items-end justify-between gap-3">
            <p className="font-mono text-[10px] text-neon flex items-center gap-1.5">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-neon" aria-hidden="true" />
              {t('badgeStatus')}
            </p>
            <div
              aria-hidden="true"
              className="h-7 w-20 opacity-70"
              style={{ background: 'repeating-linear-gradient(90deg,#e6edf6 0 2px,transparent 2px 4px,#e6edf6 4px 5px,transparent 5px 8px,#e6edf6 8px 11px,transparent 11px 12px)' }}
            />
          </div>

          {/* holographic foil */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-25 transition-opacity duration-300 group-hover/card:opacity-50"
            style={{
              backgroundImage: 'var(--holo)',
              backgroundSize: '260% 260%',
              backgroundPosition: foil,
            }}
          />
        </motion.div>
      </motion.div>

      <p className="absolute bottom-0 right-0 font-mono text-[10px] text-dim rotate-[-8deg]">↔ {t('badgeDrag')}</p>
    </div>
  );
}
