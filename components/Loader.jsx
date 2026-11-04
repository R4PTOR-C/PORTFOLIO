'use client';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const MIN_MS = 1100;   // long enough to read as an arrival, not a flash
const EXIT_MS = 800;   // matches the CSS exit timings in globals.css

/* First-visit arrival. Rendered on the server but only visible while
   html.ufo-boot is set (by the inline script in layout.js: first visit of
   the session, no reduced motion). It waits for the fonts, never less than
   MIN_MS, then the saucer shoots up and the curtain rolls away; the real
   saucer (UFO.jsx) comes down from the top to drop the headline in. */
export default function Loader() {
  const { t } = useTranslation();

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains('ufo-boot')) return;
    let done = false;
    const timers = [];
    const finish = () => {
      if (done) return;
      done = true;
      html.classList.add('ufo-boot-exit');
      timers.push(setTimeout(() => html.classList.remove('ufo-boot', 'ufo-boot-exit'), EXIT_MS));
    };
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.all([fonts, new Promise((r) => timers.push(setTimeout(r, MIN_MS)))]).then(finish);
    timers.push(setTimeout(finish, 3500));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="ufo-loader" aria-hidden="true">
      <div className="ufo-loader-stage">
        <svg viewBox="0 0 120 70" className="ufo-loader-ship">
          <ellipse cx="60" cy="28" rx="20" ry="17" fill="#2b9ada" />
          <ellipse cx="53" cy="21" rx="7" ry="4.5" fill="#cdeeff" opacity="0.9" />
          <rect x="59" y="2" width="2" height="10" fill="#4d545c" />
          <circle className="ufo-loader-beacon" cx="60" cy="3" r="3.2" fill="#00e5a0" />
          <ellipse cx="60" cy="42" rx="56" ry="13" fill="#c4cacf" />
          <ellipse cx="60" cy="39" rx="56" ry="8" fill="#eef1f3" opacity="0.6" />
          <ellipse cx="60" cy="47" rx="38" ry="6" fill="#30363d" />
          {[10, 24, 40, 60, 80, 96, 110].map((x, i) => (
            <circle key={x} className="ufo-loader-lamp" style={{ animationDelay: `${i * 0.12}s` }} cx={x} cy={x === 10 || x === 110 ? 42 : 46} r="2.6" fill="#ffb547" />
          ))}
          <ellipse cx="60" cy="53" rx="12" ry="3" fill="#7cc8f0" />
        </svg>
        <div className="ufo-loader-beam" />
        <p className="ufo-loader-text">{t('loaderText')}</p>
      </div>
    </div>
  );
}
