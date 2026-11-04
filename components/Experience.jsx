'use client';
import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Letters, { LetterHeading } from '@/components/Letters';

/* Newest first. Education closes the log as the first stop. */
const LOG = [
  { company: 'exp2Company', full: 'exp2CompanyFull', role: 'exp2Role', period: 'exp2Period', desc: ['exp2Desc1', 'exp2Desc2', 'exp2Desc3'], now: true, tone: '#00e5a0' },
  { company: 'exp1Company', full: 'exp1CompanyFull', role: 'exp1Role', period: 'exp1Period', desc: ['exp1Desc1', 'exp1Desc2', 'exp1Desc3'], tone: '#6ba6fb' },
  { company: 'eduCompany', role: 'eduRole', period: 'eduPeriod', desc: ['eduStatusLine'], tone: '#ff2bd6' },
];

function Entry({ e, i }) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative pl-12 md:pl-20 py-10 md:py-14 border-b border-border-dim"
    >
      {/* waypoint on the timeline */}
      <span
        aria-hidden="true"
        className="absolute left-[11px] md:left-[27px] top-[3.4rem] md:top-[4.4rem] w-3.5 h-3.5 rounded-full border-2 bg-bg transition-transform duration-300 group-hover:scale-150"
        style={{ borderColor: e.tone }}
      />
      {/* hover sweep */}
      <span aria-hidden="true" className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, ${e.tone}12, transparent 60%)` }} />

      <div className="grid md:grid-cols-12 gap-x-10 gap-y-5">
        <div className="md:col-span-5">
          <p className="font-mono text-xs uppercase tracking-[0.18em] flex items-center gap-2" style={{ color: e.tone }}>
            LOG {String(LOG.length - i).padStart(2, '0')} · {t(e.period)}
            {e.now && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 px-2 py-0.5 text-[10px] text-neon normal-case tracking-normal">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-neon" aria-hidden="true" />{t('expNow')}
              </span>
            )}
          </p>
          <h3 className="display text-3xl md:text-5xl mt-4 text-text leading-[0.95] transition-colors duration-300 group-hover:text-white">
            <span className="sr-only">{t(e.company)}</span>
            <span aria-hidden="true"><Letters text={t(e.company)} /></span>
          </h3>
          {e.full && <p className="mt-3 text-sm text-dim">{t(e.full)}</p>}
          <p className="mt-4 font-mono text-sm text-muted">{t(e.role)}</p>
        </div>

        <ul className="md:col-span-7 space-y-3 md:pt-8">
          {e.desc.map((k) => (
            <li key={k} className="flex gap-3 text-muted leading-relaxed">
              <span aria-hidden="true" className="mt-2.5 w-4 h-px shrink-0" style={{ background: e.tone }} />
              {t(k)}
            </li>
          ))}
        </ul>
      </div>
    </motion.li>
  );
}

export default function Experience() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const prog = useSpring(scrollYProgress, { stiffness: 140, damping: 26 });
  const shipTop = useTransform(prog, (v) => `${v * 100}%`);

  return (
    <section id="experience" className="relative section rule">
      <div className="wrap">
        <p className="kicker">{t('expKicker')}</p>
        <LetterHeading text={t('experienceTitle')} className="display h-section mt-6 text-text" />

        <div ref={ref} className="relative mt-14">
          {/* timeline rail, filled as you scroll, with a tiny saucer riding it */}
          <div aria-hidden="true" className="absolute left-[17px] md:left-[33px] top-0 bottom-0 w-px bg-border" />
          <motion.div aria-hidden="true" className="absolute left-[17px] md:left-[33px] top-0 w-px origin-top bg-gradient-to-b from-neon via-blue-light to-magenta" style={{ scaleY: prog, height: '100%' }} />
          <motion.div aria-hidden="true" className="absolute left-[5px] md:left-[21px] -mt-3 text-xl" style={{ top: shipTop }}>
            <svg viewBox="0 0 32 20" className="w-6 h-4 drop-shadow-[0_0_8px_rgba(0,229,160,0.8)]">
              <ellipse cx="16" cy="7" rx="6" ry="5" fill="#2b9ada" />
              <ellipse cx="16" cy="12" rx="15" ry="4" fill="#c4cacf" />
              <ellipse cx="16" cy="13.5" rx="9" ry="2" fill="#30363d" />
            </svg>
          </motion.div>

          <ol>
            {LOG.map((e, i) => <Entry key={e.company} e={e} i={i} />)}
          </ol>
        </div>
      </div>
    </section>
  );
}
