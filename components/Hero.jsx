'use client';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Letters from '@/components/Letters';
import CrewBadge from '@/components/CrewBadge';
import useGoianiaTime from '@/lib/useGoianiaTime';

const CONTACT_HREF = 'mailto:rafaelcroriz7@gmail.com';

/* The landing. The headline is dropped in letter by letter by the saucer
   (data-ufo-intro marks these letters as the intro's), a synthwave floor
   scrolls underneath, and the crew badge hangs on the right. */
export default function Hero() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const now = useGoianiaTime();
  const { scrollY } = useScroll();
  const floorY = useTransform(scrollY, [0, 800], [0, 160]);
  const titleY = useTransform(scrollY, [0, 800], [0, -90]);

  const rise = (delay) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
        };

  const full = `${t('heroTitlePre')} ${t('heroTitleData')} ${t('heroTitleMid')} ${t('heroTitleBrowser')}`;

  return (
    <section className="relative min-h-[100dvh] overflow-hidden pt-28 md:pt-32 pb-24">
      {/* glow behind the badge */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 45% 55% at 78% 40%, rgba(0,229,160,0.05), transparent 70%), radial-gradient(ellipse 40% 40% at 15% 20%, rgba(59,130,246,0.05), transparent 70%)' }}
      />

      {/* synthwave floor */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-[-20%] bottom-[-10%] h-[55%] pointer-events-none"
        style={{ y: floorY, perspective: 520 }}
      >
        <div
          className="absolute inset-0 origin-bottom"
          style={{
            transform: 'rotateX(68deg)',
            backgroundImage:
              'linear-gradient(rgba(0,229,160,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,0.28) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            animation: reduce ? 'none' : 'floor-run 2.4s linear infinite',
            maskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
            WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
          }}
        />
      </motion.div>

      <div className="wrap relative grid lg:grid-cols-12 gap-12 items-center">
        <motion.div className="lg:col-span-8" style={{ y: reduce ? 0 : titleY }}>
          <motion.p {...rise(0)} className="font-mono text-xs md:text-sm text-neon caret">
            {t('heroSignal')}
            {now && <> · <time className="tabular-nums">{now.label}</time></>}
          </motion.p>

          <h1 data-ufo-intro="" className="display h-hero mt-7 text-text">
            <span className="sr-only">{full}</span>
            <span aria-hidden="true">
              <Letters text={t('heroTitlePre')} />{' '}
              <span className="text-blue-light glitch"><Letters text={t('heroTitleData')} /></span>
              <br />
              <Letters text={t('heroTitleMid')} />{' '}
              <span className="holo-letters"><Letters text={t('heroTitleBrowser')} /></span>
            </span>
          </h1>

          <motion.p {...rise(0.3)} className="mt-9 text-muted text-base md:text-xl leading-relaxed max-w-[44ch]">
            {t('heroSub')}
          </motion.p>

          <motion.div {...rise(0.4)} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href={CONTACT_HREF} className="btn btn-primary">
              {t('ctaContact')} <span aria-hidden="true">↗</span>
            </a>
            <a href="#projects" className="text-sm font-semibold text-muted underline decoration-border underline-offset-[6px] transition-colors hover:text-text hover:decoration-neon">
              {t('ctaProjects')}
            </a>
          </motion.div>
        </motion.div>

        <div className="lg:col-span-4 lg:-mt-40">
          <CrewBadge />
        </div>
      </div>

      <style>{`@keyframes floor-run { to { background-position: 0 64px; } }`}</style>
    </section>
  );
}
