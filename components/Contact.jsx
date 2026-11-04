'use client';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TbMapPin, TbCopy } from 'react-icons/tb';
import Letters, { LetterHeading } from '@/components/Letters';
import { socialLinks } from '@/lib/socialLinks';

const EMAIL = 'rafaelcroriz7@gmail.com';

/* The finale: a radar sweeping behind a giant "send a signal", the address
   as letters the saucer can steal, and a copy button for people who do not
   have a mail client wired up. */
export default function Contact() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked: the mailto link still works */ }
  };

  return (
    <section id="contact" className="relative section rule overflow-hidden">
      {/* radar */}
      <div aria-hidden="true" className="absolute right-[-18rem] md:right-[-10rem] top-1/2 -translate-y-1/2 w-[44rem] h-[44rem] pointer-events-none opacity-60">
        {[1, 0.75, 0.5, 0.25].map((s) => (
          <div key={s} className="absolute inset-0 m-auto rounded-full border border-neon/20" style={{ width: `${s * 100}%`, height: `${s * 100}%` }} />
        ))}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'conic-gradient(from 0deg, rgba(0,229,160,0.35), transparent 22%)' }}
          animate={reduce ? {} : { rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        {[[22, 30], [64, 58], [40, 76]].map(([x, y], i) => (
          <motion.span
            key={i}
            className="absolute w-2 h-2 rounded-full bg-neon"
            style={{ left: `${x}%`, top: `${y}%` }}
            animate={reduce ? {} : { opacity: [0, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay: i * 1.7 }}
          />
        ))}
      </div>

      <div className="wrap relative">
        <p className="kicker">{t('contactKicker')}</p>
        <LetterHeading text={t('contactTitle')} className="display mt-8 text-text text-[clamp(2.8rem,11vw,9rem)] leading-[0.9]" />
        <p className="mt-8 text-lg md:text-xl text-muted max-w-[40ch]">{t('contactSub')}</p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${EMAIL}`}
            className="display text-[clamp(1.1rem,3.6vw,2.6rem)] text-neon break-all underline decoration-neon/30 underline-offset-8 hover:decoration-neon"
          >
            <span className="sr-only">{EMAIL}</span>
            <span aria-hidden="true"><Letters text={EMAIL} /></span>
          </a>
          <button onClick={copy} className="btn btn-ghost !py-2 !px-4 text-xs font-mono">
            <TbCopy aria-hidden="true" className="w-4 h-4" />
            {copied ? t('contactCopied') : t('contactCopy')}
          </button>
        </div>

        <div className="mt-20 pt-6 border-t border-border-dim flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <p className="mono-label inline-flex items-center gap-2">
            <TbMapPin aria-hidden="true" className="w-4 h-4" strokeWidth={1.6} />
            {t('contactLocation')}
          </p>
          <div className="flex items-center gap-2.5">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-11 h-11 flex items-center justify-center rounded-full border border-border text-muted transition-all duration-300 hover:text-bg hover:bg-neon hover:border-neon hover:-translate-y-1 hover:rotate-6"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
