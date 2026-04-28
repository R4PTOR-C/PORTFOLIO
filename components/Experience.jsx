'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from '@/components/FadeIn';

const experiences = [
  {
    companyKey:     'exp2Company',
    companyFullKey: null,
    roleKey:        'exp2Role',
    periodKey:      'exp2Period',
    descKeys:       ['exp2Desc1', 'exp2Desc2', 'exp2Desc3'],
    current:        true,
  },
  {
    companyKey:     'exp1Company',
    companyFullKey: 'exp1CompanyFull',
    roleKey:        'exp1Role',
    periodKey:      'exp1Period',
    descKeys:       ['exp1Desc1', 'exp1Desc2', 'exp1Desc3'],
    current:        false,
  },
];

export default function Experience() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const exp = experiences[active];

  return (
    <section id="experience" className="py-20 md:py-28 px-6 border-t border-border-dim">
      <div className="max-w-6xl mx-auto">

        <FadeIn>
          <div className="section-tag">{t('experienceTag')}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-text">{t('experienceTitle')}</h2>
        </FadeIn>

        {/* ── DESKTOP: tab sidebar ── */}
        <div className="hidden md:flex mt-12 gap-12">

          {/* Left: company tabs */}
          <div className="relative flex flex-col border-l border-border-dim shrink-0" style={{ minWidth: 230 }}>
            {experiences.map((e, i) => (
              <button
                key={e.companyKey}
                onClick={() => setActive(i)}
                className="relative text-left px-6 py-5 focus:outline-none"
              >
                {active === i && (
                  <motion.div
                    layoutId="exp-indicator"
                    className="absolute left-0 inset-y-0 w-0.5 rounded-full"
                    style={{ background: e.current ? '#00e5a0' : '#60a5fa' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className={`block text-sm font-mono font-semibold transition-colors duration-200 ${
                  active === i ? (e.current ? 'text-neon' : 'text-blue-light') : 'text-dim hover:text-muted'
                }`}>
                  {t(e.companyKey)}
                </span>
                <span className="block text-[11px] text-dim font-mono mt-0.5">{t(e.periodKey)}</span>
              </button>
            ))}
          </div>

          {/* Right: detail panel */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                  <div>
                    <h3 className="text-text font-bold text-xl leading-snug">{t(exp.roleKey)}</h3>
                    <p className={`text-sm font-mono font-semibold mt-1 ${exp.current ? 'text-neon' : 'text-blue-light'}`}>
                      {t(exp.companyKey)}
                      {exp.companyFullKey && (
                        <span className="text-dim font-normal ml-2 text-xs">— {t(exp.companyFullKey)}</span>
                      )}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-mono font-semibold px-3 py-1.5 rounded-full border ${
                    exp.current ? 'border-neon/30 text-neon bg-neon/5' : 'border-border text-dim bg-surface'
                  }`}>
                    {t(exp.periodKey)}
                  </span>
                </div>

                <div className="h-px bg-border-dim my-5" />

                <ul className="flex flex-col gap-3">
                  {exp.descKeys.map((key, j) => (
                    <motion.li
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.08, duration: 0.25 }}
                      className="flex gap-3 text-sm text-muted leading-relaxed"
                    >
                      <span className={`mt-1 shrink-0 text-xs ${exp.current ? 'text-neon' : 'text-blue-mid'}`}>▸</span>
                      {t(key)}
                    </motion.li>
                  ))}
                </ul>

                {exp.current && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.28 }}
                    className="mt-6 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-neon pulse-dot" />
                    <span className="text-[11px] font-mono text-neon/60 tracking-widest uppercase">{t('aboutActive')}</span>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── MOBILE: timeline cards ── */}
        <div className="md:hidden mt-10 relative pl-5">
          <div className="absolute left-0 top-3 bottom-3 w-px" style={{ background: 'rgba(20,34,56,0.8)' }} />

          <div className="flex flex-col gap-8">
            {experiences.map((e, i) => (
              <FadeIn key={e.companyKey} delay={i * 0.1} direction="right">
                <div className="relative">
                  {e.current ? (
                    <span className="absolute -left-[1.65rem] top-2 w-3 h-3 rounded-full bg-neon pulse-dot" />
                  ) : (
                    <span className="absolute -left-[1.65rem] top-2 w-3 h-3 rounded-full bg-blue-mid/60 border border-blue-mid" />
                  )}
                  <div className="card rounded-2xl p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="text-text font-bold text-lg leading-snug">{t(e.companyKey)}</h3>
                        {e.companyFullKey && (
                          <p className="text-dim text-xs mt-0.5">{t(e.companyFullKey)}</p>
                        )}
                      </div>
                      <span className={`shrink-0 text-xs font-mono font-semibold px-3 py-1.5 rounded-full border ${
                        e.current ? 'border-neon/30 text-neon bg-neon/5' : 'border-border text-dim bg-surface'
                      }`}>
                        {t(e.periodKey)}
                      </span>
                    </div>
                    <p className={`text-sm font-semibold font-mono tracking-wide mb-4 ${e.current ? 'text-neon' : 'text-blue-light'}`}>
                      {t(e.roleKey)}
                    </p>
                    <div className="h-px bg-border-dim mb-4" />
                    <ul className="flex flex-col gap-3">
                      {e.descKeys.map((key) => (
                        <li key={key} className="flex gap-3 text-sm text-muted leading-relaxed">
                          <span className={`mt-1 shrink-0 text-xs ${e.current ? 'text-neon' : 'text-blue-mid'}`}>▸</span>
                          {t(key)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
