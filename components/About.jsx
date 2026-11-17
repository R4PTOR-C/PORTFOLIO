'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import UfoWorkbench from '@/components/UfoWorkbench';

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
  return (
    <section id="about" className="section relative">
      <div className="wrap">
        <p className="kicker">{t('aboutKicker')}</p>

        <div className="mt-10 max-w-[62rem]">
          <ScrubText text={t('aboutText')} highlights={t('aboutHighlights').split('|')} />
        </div>

        <div className="mt-20 md:mt-28">
          <UfoWorkbench />
        </div>
      </div>
    </section>
  );
}
