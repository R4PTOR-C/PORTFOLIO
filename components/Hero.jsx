'use client';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const up = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="hero-bg grid-pattern relative min-h-screen flex items-center overflow-hidden">

      {/* Glow orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-blue/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-neon/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 md:px-12 pt-28 pb-20">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl">

          {/* Label */}
          <motion.div variants={up} className="section-tag mb-8">
            {t('heroHello')}
          </motion.div>

          {/* Name */}
          <motion.div variants={up} className="leading-none mb-6">
            <div className="flex items-baseline gap-4 flex-wrap">
              <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-extrabold tracking-tight text-text">
                Rafael
              </h1>
              <span className="text-sm md:text-base font-mono font-semibold text-dim tracking-[0.2em] uppercase self-end pb-2 md:pb-3">
                Full-Stack Developer
              </span>
            </div>
            <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-extrabold tracking-tight gradient-text">
              Caldas.
            </h1>
          </motion.div>

          {/* Role badge */}
          <motion.div variants={up} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon/25 bg-neon/5 text-neon text-sm font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-neon pulse-dot" />
              {t('heroRole')}
            </span>
          </motion.div>

          {/* Description */}
          <motion.p variants={up} className="text-muted text-base md:text-lg leading-relaxed max-w-xl mb-10">
            {t('heroDescription')}
          </motion.p>

          {/* Actions */}
          <motion.div variants={up} className="flex flex-wrap items-center gap-4">
            <a
              href="mailto:rafaelcroriz7@gmail.com"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-neon text-bg rounded-lg text-sm font-bold transition-all duration-200 hover:bg-neon-dim hover:shadow-[0_0_24px_rgba(0,229,160,0.3)] hover:-translate-y-0.5"
            >
              {t('heroCta')}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <div className="flex items-center gap-2">
              {[
                { label: 'GitHub',    href: 'https://github.com/R4PTOR-C',                         icon: <GithubIcon />    },
                { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/rafael-caldas-76174b207', icon: <LinkedinIcon />  },
                { label: 'Instagram', href: 'https://instagram.com/rafaelroriz7',                  icon: <InstagramIcon /> },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex items-center justify-center w-11 h-11 rounded-lg border border-border text-muted hover:text-neon hover:border-neon/30 hover:bg-neon/5 transition-all duration-200 hover:-translate-y-0.5"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-dim text-[10px] font-mono tracking-[0.25em]">SCROLL</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-neon/40 to-transparent"
        />
      </motion.div>
    </section>
  );
}
