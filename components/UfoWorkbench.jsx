'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbArrowUpRight } from 'react-icons/tb';

const SCRIPT_URL = 'https://github.com/R4PTOR-C/PORTFOLIO/blob/main/tools/ufo/build_ufo.py';
const MODES = ['wire', 'clay', 'final'];
const TOUR_STEP = 1700;   // ms each pass holds on the first walk-through

/* The saucer on a turntable, shown the way it was made: wireframe, clay
   with the baked AO, then the finished materials. On first view it walks
   through the three passes once; after that the buttons are the viewer's.
   The WebGL scene (components/ufoWorkbench.js) loads only near the
   viewport and renders only while visible, like the Atlanteon phone. */
export default function UfoWorkbench() {
  const { t, i18n } = useTranslation();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const touched = useRef(false);
  const [mode, setMode] = useState('final');
  const [stats, setStats] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let scene = null, raf = 0, visible = false, disposed = false, last = 0, loading = false, toured = false, ratio = 0;
    const timers = [];

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

    const pick = (m, instant) => { setMode(m); if (scene) scene.setMode(m, instant); };
    const tour = () => {
      if (toured || reduced || touched.current || !scene) return;
      toured = true;
      pick('wire', true);
      timers.push(setTimeout(() => !touched.current && pick('clay'), TOUR_STEP));
      timers.push(setTimeout(() => !touched.current && pick('final'), TOUR_STEP * 2));
    };

    const load = () => {
      if (loading) return;
      loading = true;
      import('./ufoWorkbench')
        .then(({ createWorkbench }) => createWorkbench(canvas))
        .then((s) => {
          if (disposed) { s.dispose(); return; }
          scene = s;
          sceneRef.current = s;
          setStats(s.stats);
          size();
          setReady(true);
          if (ratio >= 0.6) tour();
          start();
        })
        .catch(() => { /* no WebGL: the section reads fine without the model */ });
    };

    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { load(); near.disconnect(); } }, { rootMargin: '600px 0px' });
    /* render as soon as any of it shows; start the walk-through only once
       most of it is on screen, so it is not over before anyone sees it */
    const seen = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      ratio = e.intersectionRatio;
      if (visible) start();
      if (ratio >= 0.6) tour();
    }, { threshold: [0, 0.6] });
    near.observe(wrap);
    seen.observe(wrap);
    window.addEventListener('resize', size);

    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
      near.disconnect(); seen.disconnect();
      window.removeEventListener('resize', size);
      if (raf) cancelAnimationFrame(raf);
      if (scene) scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  const choose = (m) => {
    touched.current = true;
    setMode(m);
    if (sceneRef.current) sceneRef.current.setMode(m);
  };

  const n = (v) => v.toLocaleString(i18n.language === 'en' ? 'en-US' : 'pt-BR');

  return (
    <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8 items-center">
      <div ref={wrapRef} className="lg:col-span-7 relative aspect-[16/10] w-full">
        <div aria-hidden="true" className="absolute inset-x-[12%] bottom-[14%] h-[18%] rounded-[50%] bg-neon/[0.06] blur-2xl pointer-events-none" />
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t('benchAlt')}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      <div className="lg:col-span-5">
        <p className="mono-label">{t('benchLabel')}</p>
        <p className="mt-4 text-muted leading-relaxed max-w-[46ch]">{t('benchText')}</p>

        <div role="group" aria-label={t('benchLabel')} className="mt-8 inline-flex rounded-full border border-border p-1">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => choose(m)}
              disabled={!ready}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200 disabled:opacity-40 ${mode === m ? 'bg-neon text-bg' : 'text-muted hover:text-text'}`}
            >
              {t(`benchMode_${m}`)}
            </button>
          ))}
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 max-w-[22rem] text-sm">
          {[
            ['benchTris', stats && n(stats.triangles)],
            ['benchVerts', stats && n(stats.vertices)],
            ['benchMats', stats && stats.materials],
            ['benchAo', stats && stats.aoSize],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-dim">{t(k)}</dt>
              <dd className="mt-0.5 text-text tabular-nums">{v ?? '—'}</dd>
            </div>
          ))}
        </dl>

        <a
          href={SCRIPT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-muted underline decoration-border underline-offset-[6px] transition-colors hover:text-text hover:decoration-neon"
        >
          {t('benchScript')}
          <TbArrowUpRight aria-hidden="true" className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}
