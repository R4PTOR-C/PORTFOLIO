'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TbArrowUpRight } from 'react-icons/tb';

const SITE = 'https://www.atlanteontraining.com.br/';
const STACK = ['React', 'Capacitor', 'Express', 'PostgreSQL', 'Socket.IO', 'OpenAI'];
const SCREEN = '/projects/atlanteon-screen.webp';

/* The phone is a WebGL scene (components/phoneScene.js), loaded only when the
   section gets close to the viewport and rendered only while it is visible.
   Until then, or without WebGL, a flat CSS phone with the same screen. */
function Phone3D() {
  const { t } = useTranslation();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let scene = null, raf = 0, visible = false, disposed = false, last = 0, loading = false;

    const size = () => {
      if (!scene) return;
      const r = wrap.getBoundingClientRect();
      scene.resize(r.width, r.height, Math.min(window.devicePixelRatio || 1, 2));
    };
    const loop = (now) => {
      raf = 0;
      if (!visible || !scene) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      scene.tick(dt, reduced);
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && visible && scene) { last = 0; raf = requestAnimationFrame(loop); } };

    const load = () => {
      if (loading) return;
      loading = true;
      import('./phoneScene')
        .then(({ createPhoneScene }) => createPhoneScene(canvas, { screenUrl: SCREEN, iconUrl: '/projects/atlanteon-icon.png' }))
        .then((s) => {
          if (disposed) { s.dispose(); return; }
          scene = s;
          size();
          setReady(true);
          start();
        })
        .catch(() => { /* keep the flat phone */ });
    };

    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) load(); }, { rootMargin: '600px' });
    const seen = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was && scene && !reduced) scene.spinIn();
      start();
    }, { threshold: 0.15 });
    near.observe(wrap);
    seen.observe(wrap);
    window.addEventListener('resize', size);

    return () => {
      disposed = true;
      near.disconnect(); seen.disconnect();
      window.removeEventListener('resize', size);
      if (raf) cancelAnimationFrame(raf);
      if (scene) scene.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[520px] md:h-[640px]">
      {/* backdrop: blue glow + radar rings */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(63,134,216,0.28), transparent 60%)' }} />
      {[220, 320, 420].map((r, i) => (
        <div key={r} aria-hidden="true" className="absolute left-1/2 top-1/2 rounded-full border border-blue-light/15 pointer-events-none" style={{ width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r, opacity: 1 - i * 0.25 }} />
      ))}

      {/* flat fallback */}
      <div aria-hidden={ready} className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-[230px] rounded-[34px] border-[6px] border-[#16233a] bg-[#16233a] shadow-2xl overflow-hidden rotate-[-6deg]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SCREEN} alt={t('projAtlDesc')} width={600} height={1298} className="w-full h-auto rounded-[28px]" />
        </div>
      </div>

      <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-pan-y transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">↔ {t('projAtlDrag')}</p>
    </div>
  );
}

export default function Projects() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const facts = ['projAtlFact1', 'projAtlFact2', 'projAtlFact3'];

  return (
    <section id="projects" className="section relative rule overflow-hidden">
      <div className="wrap">
        <p className="kicker">{t('projectsKicker')}</p>

        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 40, filter: 'blur(12px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/projects/atlanteon-wordmark.png" alt="Atlanteon" width={800} height={148} className="w-full max-w-[780px] h-auto" />
        </motion.h2>

        <div className="mt-6 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <Phone3D />
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <p className="font-mono text-xs text-neon flex items-center gap-2">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-neon" aria-hidden="true" />
              {t('projAtlStatus')} · atlanteontraining.com.br
            </p>
            <p className="mt-6 text-lg md:text-xl text-text leading-relaxed">{t('projAtlDesc')}</p>

            <ol className="mt-10 space-y-6">
              {facts.map((k, i) => (
                <motion.li
                  key={k}
                  initial={reduce ? false : { opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="grid grid-cols-[3rem_1fr] gap-3"
                >
                  <span className="display text-2xl text-blue-light/60">0{i + 1}</span>
                  <span className="text-muted leading-relaxed">{t(k)}</span>
                </motion.li>
              ))}
            </ol>

            <ul className="mt-10 flex flex-wrap gap-2">
              {STACK.map((s) => (
                <li key={s} className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted">{s}</li>
              ))}
            </ul>

            <a href={SITE} target="_blank" rel="noopener noreferrer" className="btn btn-primary group mt-10">
              {t('projAtlCta')}
              <TbArrowUpRight aria-hidden="true" className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
