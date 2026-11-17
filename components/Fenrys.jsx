'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TbArrowUpRight } from 'react-icons/tb';
import { LetterHeading } from '@/components/Letters';

const SITE = 'https://fenrystech.com.br/';
const INDIGO = '#6B80E7';

/* The studio he runs, in its own colours (silver + indigo from the Fenrys
   brand) so it reads as a different entity from the personal site around
   it. Copy is the studio's own wording from its landing page. */
export default function Fenrys() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const box = useRef(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [12, -12]), { stiffness: 120, damping: 14 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-16, 16]), { stiffness: 120, damping: 14 });
  const gx = useTransform(mx, [-1, 1], ['30%', '70%']);
  const gy = useTransform(my, [-1, 1], ['30%', '70%']);
  const glow = useTransform([gx, gy], ([a, b]) => `radial-gradient(circle at ${a} ${b}, rgba(107,128,231,0.35), transparent 60%)`);

  const onMove = (e) => {
    const r = box.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  return (
    <section id="fenrys" className="section relative rule overflow-hidden" style={{ background: 'linear-gradient(180deg, transparent, rgba(13,16,48,0.55) 30%, rgba(13,16,48,0.55) 70%, transparent)' }}>
      {/* circuit traces, echoing the ones on the wolf */}
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none opacity-40" preserveAspectRatio="none" viewBox="0 0 1200 800">
        {[[0, 120, 380, 120, 440, 180, 700, 180], [0, 640, 260, 640, 320, 580, 620, 580], [1200, 300, 900, 300, 840, 360, 760, 360], [1200, 700, 980, 700, 930, 650, 800, 650]].map((d, i) => (
          <g key={i}>
            <polyline points={d.join(' ')} fill="none" stroke={INDIGO} strokeWidth="1.2" strokeDasharray="8 10">
              {!reduce && <animate attributeName="stroke-dashoffset" from="0" to={i % 2 ? '90' : '-90'} dur={`${4 + i}s`} repeatCount="indefinite" />}
            </polyline>
            <circle cx={d[6]} cy={d[7]} r="4" fill="none" stroke={INDIGO} strokeWidth="1.5" />
          </g>
        ))}
      </svg>

      <div className="wrap relative grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6">
          <p className="kicker" style={{ color: INDIGO }}>{t('fenrysKicker')}</p>
          <LetterHeading text={t('fenrysTitle')} className="display h-section mt-6 text-text" />
          <p className="mt-6 font-mono text-sm" style={{ color: '#9AADF2' }}>{t('fenrysRole')} · {t('fenrysPlace')}</p>
          <p className="mt-6 text-lg text-muted leading-relaxed max-w-[48ch]">{t('fenrysDesc')}</p>


          <a
            href={SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="btn group mt-10 text-white"
            style={{ background: INDIGO, boxShadow: '0 10px 30px -14px rgba(107,128,231,0.45)' }}
          >
            {t('fenrysCta')}
            <TbArrowUpRight aria-hidden="true" className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* the wolf: floats, tilts toward the pointer, glow follows it */}
        <div className="lg:col-span-6 order-first lg:order-none">
          <a
            ref={box}
            href={SITE}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('fenrysCta')}
            onPointerMove={onMove}
            onPointerLeave={() => { mx.set(0); my.set(0); }}
            className="relative block aspect-square max-w-[260px] sm:max-w-[360px] lg:max-w-[520px] mx-auto"
            style={{ perspective: 1000 }}
          >
            <motion.div aria-hidden="true" className="absolute inset-0 rounded-full" style={{ background: glow }} />
            {[0.95, 0.72].map((s, i) => (
              <motion.div
                key={s}
                aria-hidden="true"
                className="absolute rounded-full border"
                style={{ inset: `${(1 - s) * 50}%`, borderColor: 'rgba(107,128,231,0.25)', borderStyle: i ? 'dashed' : 'solid' }}
                animate={reduce ? {} : { rotate: i ? -360 : 360 }}
                transition={{ duration: 40 + i * 20, repeat: Infinity, ease: 'linear' }}
              />
            ))}
            <motion.div
              className="absolute inset-[14%]"
              style={{ rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry, transformStyle: 'preserve-3d' }}
              animate={reduce ? {} : { y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/projects/fenrys-logo.webp"
                alt="Fenrys Tech"
                width={640}
                height={544}
                className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(107,128,231,0.25)]"
                style={{ transform: 'translateZ(40px)' }}
              />
            </motion.div>
          </a>
        </div>
      </div>
    </section>
  );
}
