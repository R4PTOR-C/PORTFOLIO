'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/* One paragraph, read at the speed you scroll: words light up from dim to
   full as the text passes through the middle of the screen, and the names
   that matter (places, company, product) light up in colour. */
function Word({ children, progress, range, hot }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const color = useTransform(progress, range, ['#6b7d96', hot ? '#00e5a0' : '#e6edf6']);
  return (
    <motion.span style={{ opacity, color }} className="inline">
      {children}
    </motion.span>
  );
}

function ScrubText({ text, highlights }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] });

  /* split into words, then mark the ones inside a highlighted phrase */
  const words = text.split(' ');
  const hot = new Set();
  for (const phrase of highlights) {
    const pw = phrase.split(' ');
    for (let i = 0; i + pw.length <= words.length; i++) {
      if (pw.every((w, j) => words[i + j].replace(/[.,:]/g, '') === w)) for (let j = 0; j < pw.length; j++) hot.add(i + j);
    }
  }

  if (reduce) {
    return (
      <p ref={ref} className="display text-[clamp(1.5rem,3.4vw,2.9rem)] leading-[1.18] tracking-[-0.03em] text-text">
        {words.map((w, i) => <span key={i} className={hot.has(i) ? 'text-neon' : ''}>{w} </span>)}
      </p>
    );
  }

  return (
    <p ref={ref} className="display text-[clamp(1.5rem,3.4vw,2.9rem)] leading-[1.18] tracking-[-0.03em]">
      {words.map((w, i) => {
        const a = i / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[a - 0.04, a + 0.04]} hot={hot.has(i)}>
            {w}{' '}
          </Word>
        );
      })}
    </p>
  );
}

export default function About() {
  const { t } = useTranslation();
  const tiles = [
    { label: 'aboutCompanyLabel', value: 'aboutCompany', href: '#fenrys' },
    { label: 'aboutNowLabel', value: 'aboutNow', href: '#projects' },
    { label: 'aboutStatusLabel', value: 'aboutStatus', live: true },
  ];

  return (
    <section id="about" className="section relative">
      <div className="wrap">
        <p className="kicker">{t('aboutKicker')}</p>

        <div className="mt-10 max-w-[62rem]">
          <ScrubText text={t('aboutText')} highlights={t('aboutHighlights').split('|')} />
        </div>

        <ul className="mt-16 grid sm:grid-cols-3 gap-4">
          {tiles.map(({ label, value, href, live }, i) => {
            const inner = (
              <>
                <p className="mono-label">{t(label)}</p>
                <p className="mt-3 display text-lg leading-tight text-text flex items-center gap-2.5">
                  {live && <span className="pulse-dot w-2 h-2 rounded-full bg-neon shrink-0" aria-hidden="true" />}
                  {t(value)}
                </p>
              </>
            );
            return (
              <motion.li
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                {href ? (
                  <a href={href} className="panel block p-6 h-full transition-all duration-300 hover:-translate-y-1 hover:border-neon/40">{inner}</a>
                ) : (
                  <div className="panel p-6 h-full">{inner}</div>
                )}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
