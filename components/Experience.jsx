'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

function AnimatedTrack() {
  const ref  = useRef(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const full = parent.getBoundingClientRect().height - 24;
        let start = null;
        const duration = 900;
        const tick = (ts) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 2);
          setH(Math.round(ease * full));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute left-0 top-3 w-px overflow-hidden" style={{ height: `${h}px`, background: 'linear-gradient(to bottom, #00e5a0, #3b82f6)', boxShadow: '0 0 6px rgba(0,229,160,0.4)', transition: 'none' }} />
  );
}

export default function Experience() {
  const { t } = useTranslation();

  return (
    <section id="experience" className="py-20 md:py-28 px-6 border-t border-border-dim">
      <div className="max-w-6xl mx-auto">

        <FadeIn>
          <div className="section-tag">{t('experienceTitle')}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-text">{t('experienceTitle')}</h2>
        </FadeIn>

        <div className="mt-12 relative pl-5 md:pl-7">
          {/* Static dim track */}
          <div className="absolute left-0 top-3 bottom-3 w-px" style={{ background: 'rgba(20,34,56,0.8)' }} />
          {/* Animated colored track */}
          <AnimatedTrack />

          <div className="flex flex-col gap-8">
            {experiences.map((exp, i) => (
              <FadeIn key={exp.companyKey} delay={i * 0.1} direction="right">
                <div className="relative">
                  {exp.current ? (
                    <span className="absolute -left-[1.65rem] md:-left-[1.9rem] top-2 w-3 h-3 rounded-full bg-neon pulse-dot" />
                  ) : (
                    <span className="absolute -left-[1.65rem] md:-left-[1.9rem] top-2 w-3 h-3 rounded-full bg-blue-mid/60 border border-blue-mid" />
                  )}

                  <div className="card rounded-2xl p-6 md:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="text-text font-bold text-lg md:text-xl leading-snug">
                          {t(exp.companyKey)}
                        </h3>
                        {exp.companyFullKey && (
                          <p className="text-dim text-xs mt-0.5">{t(exp.companyFullKey)}</p>
                        )}
                      </div>
                      <span className={`shrink-0 text-xs font-mono font-semibold px-3 py-1.5 rounded-full border ${
                        exp.current
                          ? 'border-neon/30 text-neon bg-neon/8'
                          : 'border-border text-dim bg-surface'
                      }`}>
                        {t(exp.periodKey)}
                      </span>
                    </div>

                    <p className={`text-sm font-semibold font-mono tracking-wide mb-5 ${exp.current ? 'text-neon' : 'text-blue-light'}`}>
                      {t(exp.roleKey)}
                    </p>

                    <div className="h-px bg-border-dim mb-5" />

                    <ul className="flex flex-col gap-3">
                      {exp.descKeys.map((key) => (
                        <li key={key} className="flex gap-3 text-sm text-muted leading-relaxed">
                          <span className={`mt-1 shrink-0 text-xs ${exp.current ? 'text-neon' : 'text-blue-mid'}`}>▸</span>
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
