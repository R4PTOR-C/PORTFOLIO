'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* ═══════════════════════════════════════════════════════════════════════════
   UFO — canvas game overlay
   ───────────────────────────────────────────────────────────────────────────
   IDLE    : the saucer patrols the top strip, banking into its own drift and
             reacting to scroll velocity. Click it to boot ARCADE MODE.
   LETTERS : the hero headline is made of letters the saucer owns. It drops
             them in one by one on the first visit, and now and then (or
             when a letter is clicked) it beams one up and lets it fall back.
   ARCADE  : full game loop — pointer steering with a critically damped spring,
             auto-aimed twin cannons, Galaga-ish enemy waves, drops, combo,
             hit-stop, screen shake. ESC exits.
   Everything runs on one rAF with dt-scaled integration; React never
   re-renders during play.
   ═══════════════════════════════════════════════════════════════════════════ */

const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);

const C = {
  neon: '#00e5a0',
  neonDim: '#00b87d',
  blue: '#3b82f6',
  violet: '#a78bfa',
  red: '#ff4545',
  amber: '#ff9d2e',
  white: '#dff5ff',
  dim: '#475569',
};

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/* Damped spring step — stable for the dt we clamp to. */
function springStep(cur, vel, target, stiffness, damping, dt) {
  const acc = (target - cur) * stiffness - vel * damping;
  const nv = vel + acc * dt;
  return [cur + nv * dt, nv];
}

/* ─────────────────────────── pixel saucer sprite ────────────────────────── */
/* 67x25 cells, generated (scratchpad pixel/gen.cjs) from ellipses lit from
   the upper left: glass dome with a curved glint, banded silver hull with a
   pressed seam, rim lamps spaced by angle so they bunch toward the edges,
   dark belly with ports, emitter lens underneath. */
const SPR = [
  '..............................BBBBBBB..............................',
  '...........................BBBDHJJJJJBBB...........................',
  '.........................BBGGDHDDDDDDJJJBB.........................',
  '........................BGGDDDDDDDDDDDDJJJB........................',
  '.......................BGHHHHDDDDDDDDDDDJJJB.......................',
  '......................BDGHHHHDDDDDDDDDDDHJJJB......................',
  '.....................BDGHHHHHDDDDDDDDDDDJHJJJB.....................',
  '.....................BHHHHHHHDDDDDDDDDDDJJHJJB.....................',
  '....................BDHHHHHHDDDDDDDDDDDDJJJJJJB....................',
  '...................BBJDDDDDJJJJJJJJJJJJJJJJJJJBB...................',
  '................BBBEAAAAAAAAAAAAAAAAAAAAAAAAAAAEBBB................',
  '...........BBBBBWWWWWWCCCCCCCCCCCCCCCFFFFFFFFFFFFFFBBBBB...........',
  '.......BBBBWWWWWWWCCCCCCCCCCCCCCCCCCCFFFFFFFFFFFFFFFFEEEBBBB.......',
  '....BBBWWWWWWWWWFFFFCCCCCCCCCCCCCCCCCFFFFFFFFFFEEEEFFEEEEEEEBBB....',
  '..BBWWWCCCCCCCCCCCFFFFFFFFFFFFFFFFFFFEEEEEEEEEEEEEEEEEEEEEEEEEEBB..',
  '.BFWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWCCCCCCCCCCCCCCCCCCCCCCCFB.',
  '.BAAAIAAAIIAAAAIIAAAAAAIIAAAAAAAAIIAAAAAAAIIAAAAAAIIAAAAIIAAAIAAAB.',
  '.BKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKB.',
  '..BBKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKNNNNNNNNNNNNNNNNNNNNNBB..',
  '....BBBBNNNNNNLNNNNNNNLNNNNNNNNNNNNNNNNNNNNNLNNNNNNNLNNNNNNBBBB....',
  '........BBBBNNNNNNNNNNNNNNNLNNNNNNNNNNNLNNNNNNNNNNNNNNNBBBB........',
  '............BBBBBNNNNNNNNAAAAAAAAAAAAAAAAANNNNNNNNBBBBB............',
  '.................BBBBBBBBLLLLLLLHHHLLLLLLLBBBBBBBB.................',
  '.........................BBBHHHGGGGGHHHBBB.........................',
  '............................BBBBBBBBBBB............................',
];
const SPR_W = 67, SPR_H = 25;
const PX = 80 / SPR_W;            /* keeps the old body half-width of 40 */
const RIM_ROW = 16.5;             /* the lamp row sits on the local origin */
const LENS_ROW = 23.5;
const SPR_OY = -RIM_ROW * PX + 1;
const FIN_PX = 80 / 45;           /* mothership fins keep their original block size */

/* Player and foe read the same sprite through different palettes. */
const PAL = {
  ship: { B: '#14161a', K: '#30363d', N: '#23282e', A: '#3d444c', E: '#5f666e',
          F: '#8e959c', C: '#c4cacf', W: '#eef1f3', J: '#1a5f99', D: '#2b9ada',
          H: '#7cc8f0', G: '#ffffff', L: '#4fb3e8', I: '#ffb547' },
  foe:  { B: '#1a0404', K: '#2e0a0a', N: '#220707', A: '#4a1010', E: '#7a2222',
          F: '#a03535', C: '#c85a5a', W: '#e88a8a', J: '#7a1414', D: '#c02828',
          H: '#ff6b6b', G: '#ffd0d0', L: '#e04848', I: '#ff9d2e' },
};

/* Bake the grid into horizontal runs once — ~160 fillRects instead of 933. */
const SPR_RUNS = [];
const SPR_LAMPS = [];
SPR.forEach((row, ry) => {
  let rx = 0;
  while (rx < row.length) {
    const ch = row[rx];
    let n = 1;
    while (rx + n < row.length && row[rx + n] === ch) n++;
    if (ch !== '.') {
      SPR_RUNS.push([rx, ry, n, ch]);
      if (ch === 'I') SPR_LAMPS.push([(rx + n / 2) * PX - (SPR_W * PX) / 2, (ry + 0.5) * PX + SPR_OY]);
    }
    rx += n;
  }
});

function drawSprite(ctx, pal, lamp) {
  const ox = -(SPR_W * PX) / 2;
  let cur = null;
  for (const [rx, ry, n, ch] of SPR_RUNS) {
    const col = ch === 'I' ? lamp : pal[ch];
    if (col !== cur) { ctx.fillStyle = col; cur = col; }
    /* half-cell bleed keeps neighbouring runs from showing hairline seams */
    ctx.fillRect(ox + rx * PX, ry * PX + SPR_OY, n * PX + 0.5, PX + 0.5);
  }
}

/* ─────────────────────────────── drawing ────────────────────────────────── */

/* Saucer drawn in local units: body half-width 40. */
function drawSaucer(ctx, o) {
  const {
    x, y, scale = 1, roll = 0, t = 0,
    accent = C.neon,
    lights = [C.neon, C.blue, C.violet],
    thrust = 0, beam = 0, flash = 0, spin = 0, big = false, foe = false,
    solid = false,                   // the WebGL layer draws the hull itself
  } = o;

  ctx.save();
  const A = ctx.globalAlpha;          // compose with whatever the caller set
  ctx.translate(x, y);
  ctx.rotate(roll);
  ctx.scale(scale, scale);

  /* tractor beam (drawn under the hull) */
  if (beam > 0.01) {
    const len = 190 * beam;
    const g = ctx.createLinearGradient(0, 6, 0, 6 + len);
    g.addColorStop(0, `rgba(0,229,160,${0.3 * beam})`);
    g.addColorStop(1, 'rgba(0,229,160,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-15, 6);
    ctx.lineTo(15, 6);
    ctx.lineTo(38 * beam + 14, 6 + len);
    ctx.lineTo(-38 * beam - 14, 6 + len);
    ctx.closePath();
    ctx.fill();
    /* rungs travelling down the cone */
    ctx.strokeStyle = `rgba(0,229,160,${0.22 * beam})`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const p = ((t * 0.5 + i * 0.25) % 1);
      const yy = 6 + len * p;
      const w = lerp(15, 52, p) * beam;
      ctx.globalAlpha = A * (1 - p) * beam;
      ctx.beginPath();
      ctx.ellipse(0, yy, w, w * 0.16, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = A;
    ctx.globalCompositeOperation = 'source-over';
  }

  /* exhaust bloom */
  if (thrust > 0.01) {
    const r = 34 * thrust;
    const g = ctx.createRadialGradient(0, 12, 0, 0, 12, r);
    g.addColorStop(0, `rgba(0,229,160,${0.5 * thrust})`);
    g.addColorStop(1, 'rgba(0,229,160,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 12, r, r * 0.6, 0, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  /* soft under-glow */
  const halo = ctx.createRadialGradient(0, 4, 2, 0, 4, 62);
  halo.addColorStop(0, `${accent}22`);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.ellipse(0, 4, 62, 20, 0, 0, TAU);
  ctx.fill();

  if (solid) { ctx.restore(); return; }

  ctx.save();
  ctx.rotate(spin);

  /* hull, dome and rim — one pixel sprite */
  const pal = PAL[foe ? 'foe' : 'ship'];
  const pulse = 0.55 + Math.sin(t * 4.2) * 0.45;
  drawSprite(ctx, pal, flash > 0.01 ? '#ffffff' : pal.I);

  if (big) {
    /* mothership fins, blocked out to match the sprite's cell grid */
    ctx.fillStyle = pal.A;
    for (const s of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const w = (5 - i) * FIN_PX;
        ctx.fillRect(s * 38 + (s < 0 ? -w : 0) + s * i * FIN_PX, -1 - i * FIN_PX, w, FIN_PX + 0.5);
      }
    }
    ctx.fillStyle = pal.B;
    for (const s of [-1, 1]) ctx.fillRect(s * 40 - (s < 0 ? FIN_PX : 0), -1, FIN_PX, FIN_PX);
  }

  /* rim + belly lamps glow */
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < SPR_LAMPS.length; i++) {
    const [lx, ly] = SPR_LAMPS[i];
    const a = clamp(0.3 + Math.sin(t * 4.2 + i * 1.3) * 0.4 + flash, 0, 1);
    ctx.fillStyle = lights[i % lights.length];
    ctx.globalAlpha = A * a * 0.55;
    ctx.beginPath(); ctx.arc(lx, ly, 2.4, 0, TAU); ctx.fill();
    ctx.globalAlpha = A * a * 0.18;
    ctx.beginPath(); ctx.arc(lx, ly, 6.5, 0, TAU); ctx.fill();
  }

  /* emitter lens bloom under the belly */
  ctx.fillStyle = accent;
  ctx.globalAlpha = A * (0.25 + pulse * 0.3);
  ctx.beginPath(); ctx.ellipse(0, SPR_OY + LENS_ROW * PX, 7, 3.5, 0, 0, TAU); ctx.fill();
  ctx.globalAlpha = A;
  ctx.globalCompositeOperation = 'source-over';

  /* antenna + beacon */
  const domeTop = SPR_OY;
  ctx.strokeStyle = `${accent}99`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, domeTop + 1);
  ctx.lineTo(0, domeTop - 8);
  ctx.stroke();
  const bl = 0.45 + Math.sin(t * 3.4) * 0.55;
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = accent;
  ctx.globalAlpha = A * clamp(bl, 0, 1);
  ctx.beginPath();
  ctx.arc(0, domeTop - 9.5, 2.4 + bl, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = A * clamp(bl, 0, 1) * 0.3;
  ctx.beginPath();
  ctx.arc(0, domeTop - 9.5, 8, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = A;
  ctx.globalCompositeOperation = 'source-over';

  ctx.restore();

  /* damage flash */
  if (flash > 0.01) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,255,255,${flash * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 13, 0, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.restore();
}

/* ──────────────────────────────── component ─────────────────────────────── */

export default function UFO() {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const backdropRef = useRef(null);
  const hitRef = useRef(null);
  const gRef = useRef(null);
  const [arcade, setArcade] = useState(false);
  const [showHint, setShowHint] = useState(false);

  /* The saucer is the best thing on this page and it was invisible as an
     affordance: the only signal was a native title tooltip on hover, which
     does not exist on touch at all. Surface it once, after the visitor has
     shown they are actually reading, then never again. */
  useEffect(() => {
    if (localStorage.getItem('ufo.seen')) return;

    const anchor = document.getElementById('about');
    if (!anchor) return;

    let timer = null;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      setShowHint(true);
      timer = setTimeout(() => setShowHint(false), 6000);
    }, { threshold: 0.2 });

    observer.observe(anchor);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    try { localStorage.setItem('ufo.seen', '1'); } catch { /* ignore */ }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── state ───────────────────────────────────────────────────────────── */
    const g = {
      mode: 'idle',            // idle | intro | play | over
      t: 0, timeScale: 1, hitStop: 0,
      w: window.innerWidth, h: window.innerHeight,
      shake: 0, shakeX: 0, shakeY: 0, flashScreen: 0, ui: 1, narrow: false,
      scrollY: window.scrollY, scrollVel: 0, docH: 1,
      pointer: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, down: false, seen: false },
      hover: 0, hoverTarget: 0,
      p: {
        x: window.innerWidth - 90, y: 120, vx: 0, vy: 0,
        roll: 0, rollV: 0, spin: 0, spinning: 0,
        thrust: 0, beam: 0, beamT: rand(4, 9), beamHold: 0,
        shields: 3, invuln: 0, flash: 0, fireCd: 0, scale: 1.15,
      },
      bullets: [], enemies: [], parts: [], pops: [], drops: [],
      score: 0, hi: 0, combo: 0, comboT: 0,
      wave: 0, waveClearT: 0, spawnQ: [],
      banner: '', bannerT: 0, introT: 0, overT: 0, hintT: 0,
      act: null, mischiefT: rand(14, 22),
      reduced,
    };
    gRef.current = g;

    try { g.hi = parseInt(localStorage.getItem('ufo.hi') || '0', 10) || 0; } catch { /* ignore */ }

    /* ── 3D ships ────────────────────────────────────────────────────────── */
    /* Loaded after first paint and only in the browser. Until it is ready,
       or if WebGL is unavailable, the pixel sprite draws the ships. */
    let three = null;
    let disposed = false;
    if (glRef.current) {
      import('./ufoShips3d')
        .then(({ createShipLayer }) => createShipLayer(glRef.current))
        .then((layer) => {
          if (disposed) { layer.dispose(); return; }
          three = layer;
          three.resize(g.w, g.h, dpr);
        })
        .catch(() => { /* keep the sprite */ });
    }

    /* ── sizing ──────────────────────────────────────────────────────────── */
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      g.w = window.innerWidth;
      g.h = window.innerHeight;
      g.docH = Math.max(1, document.documentElement.scrollHeight - g.h);
      canvas.width = Math.round(g.w * dpr);
      canvas.height = Math.round(g.h * dpr);
      canvas.style.width = `${g.w}px`;
      canvas.style.height = `${g.h}px`;
      /* Everything sized in px gets multiplied by this so a phone gets the
         whole battlefield, not a cropped zoom of the desktop one. */
      g.ui = clamp(Math.min(g.w, g.h) / 900, 0.55, 1);
      g.narrow = g.w < 720;
      if (three) three.resize(g.w, g.h, dpr);
    };
    resize();

    /* ── spawning helpers ────────────────────────────────────────────────── */
    const spark = (x, y, color, n, speed, life = 0.6, size = 2) => {
      for (let i = 0; i < n; i++) {
        if (g.parts.length > 420) break;
        const a = rand(0, TAU);
        const s = speed * rand(0.25, 1);
        g.parts.push({
          x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          life: life * rand(0.6, 1.3), max: life, size: size * rand(0.6, 1.4),
          color, drag: 2.4, ring: false,
        });
      }
    };

    const shockwave = (x, y, color, r = 60) => {
      g.parts.push({ x, y, vx: 0, vy: 0, life: 0.45, max: 0.45, size: r, color, ring: true, drag: 0 });
    };

    const popup = (x, y, text, color) => {
      g.pops.push({ x, y, text, color, life: 0.9, max: 0.9 });
    };

    const addShake = (v) => { g.shake = Math.min(1, g.shake + v); };

    const explode = (x, y, color, scale = 1) => {
      spark(x, y, color, 18 * scale, 300 * scale, 0.7, 2.4);
      spark(x, y, C.white, 8, 220, 0.35, 1.6);
      shockwave(x, y, color, 52 * scale);
      g.flashScreen = Math.max(g.flashScreen, 0.16 * scale);
      addShake(0.3 * scale);
      if (!g.reduced) g.hitStop = Math.max(g.hitStop, 0.07 * scale);
    };

    /* ── headline letters ────────────────────────────────────────────────── */
    /* Letters are plain spans; we only ever write their inline transform.
       el._ufo remembers the offset we applied so the resting position can
       be read back from getBoundingClientRect at any time. */
    const letterEls = () => Array.from(document.querySelectorAll('[data-ufo-letter]'));
    const introEls = () => Array.from(document.querySelectorAll('[data-ufo-intro] [data-ufo-letter]'));
    const restOf = (el) => {
      const r = el.getBoundingClientRect();
      const o = el._ufo || { x: 0, y: 0 };
      return { x: r.left + r.width / 2 - o.x, y: r.top + r.height / 2 - o.y, top: r.top - o.y, h: r.height };
    };
    const setLetter = (el, x, y, rot = 0, sx = 1, sy = 1) => {
      el._ufo = { x, y };
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
    };
    const clearLetter = (el) => {
      el._ufo = null;
      el.style.transform = '';
      el.style.transformOrigin = '';
    };

    /* falling letters: accelerate down from (fx, fy), land, squash, settle */
    const FALL = 0.48, SETTLE = 0.45;
    const falling = [];
    const dropLetter = (el, fx, fy) => {
      const prev = falling.findIndex((a) => a.el === el);
      if (prev >= 0) falling.splice(prev, 1);
      el.style.opacity = '1';
      el.style.transformOrigin = '50% 90%';
      falling.push({ el, t: 0, fx, fy, rot: rand(-28, 28), landed: false });
      setLetter(el, fx, fy);
    };
    const stepLetters = (dt) => {
      for (let i = falling.length - 1; i >= 0; i--) {
        const a = falling[i];
        if (!a.el.isConnected) { falling.splice(i, 1); continue; }
        a.t += dt;
        if (a.t < FALL) {
          const k = a.t / FALL;
          setLetter(a.el, a.fx * (1 - k) ** 2, a.fy * (1 - k * k), a.rot * (1 - k));
          continue;
        }
        if (!a.landed) {
          a.landed = true;
          const r = restOf(a.el);
          spark(r.x, r.top + r.h * 0.88, C.neon, 3, 70, 0.3, 1.3);
        }
        const q = (a.t - FALL) / SETTLE;
        if (q >= 1) { clearLetter(a.el); falling.splice(i, 1); continue; }
        const sy = 1 - 0.34 * Math.exp(-5 * q) * Math.cos(q * 12);
        setLetter(a.el, 0, 0, 0, 1 + (1 - sy) * 0.6, sy);
      }
    };

    const finishIntro = () => {
      document.documentElement.classList.remove('ufo-intro');
      for (const el of introEls()) el.style.opacity = '';
      try { sessionStorage.setItem('ufo.intro', '1'); } catch { /* ignore */ }
      if (g.act && g.act.kind === 'intro') g.act = null;
      g.mischiefT = rand(16, 26);
    };

    const startAbduct = (el) => {
      if (g.mode !== 'idle' || g.act || g.reduced) return;
      g.act = { kind: 'abduct', el, phase: 'go', t: 0 };
    };

    /* What the saucer is busy with, if anything. Returns where it wants to
       be this frame, or null to fall back to its normal patrol. */
    const stepAct = (dt) => {
      const a = g.act;
      const p = g.p;

      if (a.kind === 'intro') {
        a.wait -= dt;
        const els = introEls();
        if (a.i >= els.length || g.scrollY > g.h * 0.6) { finishIntro(); return null; }
        const r = restOf(els[a.i]);
        const target = { x: r.x, y: Math.max(60, r.top - 72 * g.ui) };
        const near = Math.abs(p.x - target.x) < 30 && Math.abs(p.y - target.y) < 44;
        if (a.wait <= 0 && (near || a.started)) {
          a.started = true;
          p.beamHold = 0.25;
          a.cd -= dt;
          while (a.cd <= 0 && a.i < els.length) {
            a.cd += 0.068;
            const el = els[a.i++];
            const rr = restOf(el);
            dropLetter(el, p.x - rr.x, p.y + 16 * g.ui - rr.y);
          }
        }
        return target;
      }

      /* abduct */
      const el = a.el;
      if (!el.isConnected) { g.act = null; return null; }
      const r = restOf(el);
      if (r.top < 30 || r.top > g.h - 30) {
        if (a.phase !== 'go') dropLetter(el, el._ufo ? el._ufo.x : 0, el._ufo ? el._ufo.y : 0);
        g.act = null;
        return null;
      }
      const above = { x: r.x, y: Math.max(64, r.top - 96 * g.ui) + Math.sin(g.t * 3) * 3 };
      if (a.phase === 'go') {
        if (Math.hypot(p.x - above.x, p.y - above.y) < 18 && Math.hypot(p.vx, p.vy) < 140) {
          a.phase = 'lift'; a.t = 0;
          const prev = falling.findIndex((f) => f.el === el);
          if (prev >= 0) falling.splice(prev, 1);
          el.style.transformOrigin = '50% 50%';
        }
        return above;
      }
      a.t += dt;
      p.beamHold = 0.2;
      const k = 1 - (1 - clamp(a.t / 0.9, 0, 1)) ** 3;
      const ox = p.x - r.x, oy = p.y + 22 * g.ui - r.y;
      setLetter(el, ox * k + Math.sin(g.t * 7) * 3 * k, oy * k, Math.sin(g.t * 9) * 16 * k, 1 - 0.22 * k, 1 - 0.22 * k);
      if (a.t > 1.7) {
        p.beamHold = 0;
        dropLetter(el, el._ufo.x, el._ufo.y);
        p.vx += (Math.random() < 0.5 ? -1 : 1) * 520;   // and off it goes, whistling
        p.vy -= 160;
        g.act = null;
        g.mischiefT = rand(20, 34);
      }
      return above;
    };

    if (document.documentElement.classList.contains('ufo-intro')) {
      g.act = { kind: 'intro', i: 0, wait: 0.55, cd: 0, started: false };
    }

    /* ── waves ───────────────────────────────────────────────────────────── */
    const slotPos = (i, count) => {
      const cols = Math.min(6, count);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const spanW = Math.min(g.w * 0.7, cols * 92);
      const step = cols > 1 ? spanW / (cols - 1) : 0;
      return {
        sx: g.w * 0.5 - spanW / 2 + col * step,
        sy: 130 + row * 72,
      };
    };

    const startWave = (n) => {
      g.wave = n;
      const dens = clamp(g.w / 1280, 0.5, 1);
      g.banner = `WAVE ${String(n).padStart(2, '0')}`;
      g.bannerT = 1.6;
      const count = Math.min(14, 4 + n * 2);
      const boss = n % 3 === 0;
      for (let i = 0; i < count; i++) {
        const { sx, sy } = slotPos(i, count);
        const fromLeft = i % 2 === 0;
        g.spawnQ.push({
          at: g.t + 0.7 + i * 0.13,
          make: () => g.enemies.push({
            x: fromLeft ? -80 : g.w + 80,
            y: rand(60, g.h * 0.4),
            vx: 0, vy: 0, sx, sy,
            phase: rand(0, TAU),
            state: 'enter', stateT: 0,
            hp: 1, maxHp: 1, r: 26 * g.ui, scale: 0.78 * g.ui, spin: 0,
            fireCd: rand(1.4, 4), flash: 0, big: false,
            roll: 0,
          }),
        });
      }
      if (boss) {
        g.spawnQ.push({
          at: g.t + 1.6,
          make: () => g.enemies.push({
            x: g.w * 0.5, y: -110, vx: 0, vy: 0,
            sx: g.w * 0.5, sy: 118, phase: 0,
            state: 'enter', stateT: 0,
            hp: 6 + n, maxHp: 6 + n, r: 52 * g.ui, scale: 1.5 * g.ui, spin: 0,
            fireCd: 1.6, flash: 0, big: true, roll: 0,
          }),
        });
      }
    };

    /* ── mode transitions ────────────────────────────────────────────────── */
    const enterArcade = () => {
      if (g.mode !== 'idle') return;
      if (g.act) {
        if (g.act.kind === 'intro') finishIntro();
        else if (g.act.el._ufo) dropLetter(g.act.el, g.act.el._ufo.x, g.act.el._ufo.y);
        g.act = null;
      }
      g.mode = 'intro';
      g.introT = 0;
      g.score = 0; g.combo = 0; g.wave = 0;
      g.bullets.length = 0; g.enemies.length = 0; g.drops.length = 0; g.spawnQ.length = 0;
      g.p.shields = 3; g.p.invuln = 1.2; g.p.beam = 0;
      g.hintT = 5;
      g.hoverTarget = 0;               // the hitbox goes inert, so no leave event
      g.banner = 'ARCADE MODE'; g.bannerT = 0.9;
      spark(g.p.x, g.p.y, C.neon, 26, 260, 0.8, 2.2);
      shockwave(g.p.x, g.p.y, C.neon, 90);
      setArcade(true);
      document.body.style.overflow = 'hidden';
    };

    const exitArcade = () => {
      if (g.mode === 'idle') return;
      g.mode = 'idle';
      g.bullets.length = 0; g.enemies.length = 0; g.drops.length = 0; g.spawnQ.length = 0;
      g.banner = ''; g.bannerT = 0;
      setArcade(false);
      document.body.style.overflow = '';
    };

    const restart = () => {
      g.mode = 'intro';
      g.introT = 0.45;                 // keep the letterbox up, skip the boot beat
      g.score = 0; g.combo = 0; g.comboT = 0; g.wave = 0; g.waveClearT = 0;
      g.bullets.length = 0; g.enemies.length = 0; g.drops.length = 0; g.spawnQ.length = 0;
      g.p.shields = 3; g.p.invuln = 1.4; g.p.flash = 0;
      spark(g.p.x, g.p.y, C.neon, 22, 240, 0.7, 2.2);
      shockwave(g.p.x, g.p.y, C.neon, 80);
    };

    const gameOver = () => {
      g.mode = 'over';
      g.overT = 0;
      explode(g.p.x, g.p.y, C.neon, 1.8);
      addShake(1);
      if (g.score > g.hi) {
        g.hi = g.score;
        try { localStorage.setItem('ufo.hi', String(g.hi)); } catch { /* ignore */ }
      }
    };

    /* ── input ───────────────────────────────────────────────────────────── */
    const onPointerMove = (e) => {
      g.pointer.x = e.clientX;
      /* On touch the pointer IS the finger — fly the saucer above it so the
         hand does not cover the ship or the shots coming up from below. */
      g.pointer.y = e.clientY - (e.pointerType === 'mouse' ? 0 : 74);
      g.pointer.seen = true;
    };
    const onPointerDown = (e) => {
      if (g.mode === 'play') { g.pointer.down = true; onPointerMove(e); }
      else if (g.mode === 'over' && g.overT > 0.9) restart();
    };
    const onPointerUp = () => { g.pointer.down = false; };
    const onScroll = () => {
      const y = window.scrollY;
      g.scrollVel = y - g.scrollY;
      g.scrollY = y;
      g.docH = Math.max(1, document.documentElement.scrollHeight - g.h);
    };
    const onKey = (e) => {
      if (e.key === 'Escape' && g.mode !== 'idle') exitArcade();
    };
    const onBlur = () => { g.pointer.down = false; };
    const onClickLetter = (e) => {
      const el = e.target.closest && e.target.closest('[data-ufo-letter]');
      if (el) startAbduct(el);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('blur', onBlur);
    window.addEventListener('resize', resize);
    document.addEventListener('click', onClickLetter);

    const hit = hitRef.current;
    const onHitEnter = () => { g.hoverTarget = 1; };
    const onHitLeave = () => { g.hoverTarget = 0; };
    const onHitClick = () => enterArcade();
    if (hit) {
      hit.addEventListener('pointerenter', onHitEnter);
      hit.addEventListener('pointerleave', onHitLeave);
      hit.addEventListener('click', onHitClick);
    }

    /* ── update ──────────────────────────────────────────────────────────── */
    const nearestEnemy = () => {
      let best = null, bd = Infinity;
      for (const e of g.enemies) {
        if (e.state === 'dead') continue;
        const d = (e.x - g.p.x) ** 2 + (e.y - g.p.y) ** 2;
        if (d < bd) { bd = d; best = e; }
      }
      return best;
    };

    const fire = () => {
      const p = g.p;
      const target = nearestEnemy();
      let ax = 0, ay = -1;
      if (target) {
        const dx = target.x - p.x, dy = target.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        ax = dx / d; ay = dy / d;
      }
      const speed = 980;
      for (const s of [-1, 1]) {
        g.bullets.push({
          x: p.x + s * 22 * p.scale, y: p.y + 5 * p.scale,
          vx: ax * speed + s * 30, vy: ay * speed,
          life: 1.4, friendly: true, r: 5,
        });
      }
      spark(p.x, p.y + 6 * p.scale, C.neon, 3, 90, 0.2, 1.4);
      addShake(0.045);
    };

    const enemyFire = (e) => {
      const dx = g.p.x - e.x, dy = g.p.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const speed = 300 + g.wave * 12;
      const shots = e.big ? 3 : 1;
      for (let i = 0; i < shots; i++) {
        const spread = (i - (shots - 1) / 2) * 0.22;
        const c = Math.cos(spread), s = Math.sin(spread);
        const vx = (dx / d) * speed, vy = (dy / d) * speed;
        g.bullets.push({
          x: e.x, y: e.y + 8, r: 6,
          vx: vx * c - vy * s, vy: vx * s + vy * c,
          life: 3, friendly: false,
        });
      }
    };

    const damagePlayer = () => {
      const p = g.p;
      if (p.invuln > 0 || g.mode !== 'play') return;
      p.shields -= 1;
      p.invuln = 1.5;
      p.flash = 1;
      g.combo = 0;
      addShake(0.7);
      g.flashScreen = 0.3;
      if (!g.reduced) g.hitStop = 0.1;
      spark(p.x, p.y, C.red, 22, 280, 0.7, 2.4);
      if (p.shields <= 0) gameOver();
    };

    const update = (dt) => {
      const p = g.p;
      g.t += dt;

      /* ---- player movement ---- */
      let tx, ty;
      if (g.mode === 'idle') {
        /* wander along the top strip, driven by scroll progress + slow noise */
        const prog = clamp(g.scrollY / g.docH, 0, 1);
        const m = Math.min(120, g.w * 0.12);
        const nx = 0.5 + 0.5 * Math.sin(prog * Math.PI * 2.4 + g.t * 0.16);
        tx = m + (g.w - m * 2) * nx;
        ty = 96 + Math.sin(prog * Math.PI * 3 + 1.2) * 34 + Math.sin(g.t * 0.55) * 12;
        if (g.w < 768) { tx = g.w - 70; ty = 92 + Math.sin(g.t * 0.6) * 10; }
        /* scroll gives it a shove it recovers from */
        p.vy -= clamp(g.scrollVel, -60, 60) * 130 * dt;
        g.scrollVel *= Math.exp(-6 * dt);

        /* mischief: every so often, go and borrow a letter */
        if (!g.act && !g.reduced) {
          g.mischiefT -= dt;
          if (g.mischiefT <= 0) {
            g.mischiefT = rand(20, 34);
            const els = letterEls().filter((el) => {
              const r = el.getBoundingClientRect();
              return r.top > 90 && r.bottom < g.h - 30;
            });
            if (els.length) startAbduct(els[Math.floor(Math.random() * els.length)]);
          }
        }
        if (g.act) {
          const tgt = stepAct(dt);
          if (tgt) { tx = tgt.x; ty = tgt.y; }
        }
      } else {
        const pt = g.pointer;
        tx = clamp(pt.x, 40, g.w - 40);
        ty = clamp(pt.y + 26, 60, g.h - 40);
        if (!pt.seen) { tx = g.w * 0.5; ty = g.h * 0.7; }
      }

      const busy = g.mode === 'idle' && g.act;
      const stiff = busy ? 34 : g.mode === 'idle' ? 5.5 : 62;
      const damp = busy ? 9.5 : g.mode === 'idle' ? 3.4 : 13;
      [p.x, p.vx] = springStep(p.x, p.vx, tx, stiff, damp, dt);
      [p.y, p.vy] = springStep(p.y, p.vy, ty, stiff, damp, dt);

      /* banking + thrust from velocity */
      const rollTarget = clamp(p.vx * 0.00085, -0.42, 0.42);
      [p.roll, p.rollV] = springStep(p.roll, p.rollV, rollTarget, 90, 14, dt);
      const speed = Math.hypot(p.vx, p.vy);
      p.thrust = lerp(p.thrust, clamp(speed / 700, 0, 1), 1 - Math.exp(-8 * dt));

      /* barrel roll — idle flourish */
      if (g.mode === 'idle' && !g.reduced) {
        if (p.spinning > 0) {
          p.spinning -= dt;
          p.spin += dt * TAU * 1.15;
          if (p.spinning <= 0) { p.spin = 0; }
        } else if (Math.random() < dt * 0.035) {
          p.spinning = 1 / 1.15;              // exactly one full revolution
          spark(p.x, p.y, C.blue, 10, 130, 0.5, 1.6);
        }
      } else { p.spin = 0; p.spinning = 0; }

      /* idle tractor beam */
      if (g.mode === 'idle') {
        g.p.beamT -= dt;
        if (g.p.beamT <= 0) { g.p.beamT = rand(7, 14); g.p.beamHold = 1.8; }
        if (g.p.beamHold > 0) { g.p.beamHold -= dt; g.p.beam = lerp(g.p.beam, 1, 1 - Math.exp(-6 * dt)); }
        else g.p.beam = lerp(g.p.beam, 0, 1 - Math.exp(-7 * dt));
      } else {
        g.p.beam = lerp(g.p.beam, 0, 1 - Math.exp(-9 * dt));
      }

      p.invuln = Math.max(0, p.invuln - dt);
      p.flash = Math.max(0, p.flash - dt * 3);
      g.hover = lerp(g.hover, g.hoverTarget, 1 - Math.exp(-12 * dt));

      /* ---- intro ---- */
      if (g.mode === 'intro') {
        g.introT += dt;
        if (g.introT > 0.9) { g.mode = 'play'; startWave(1); }
      }
      if (g.mode === 'over') g.overT += dt;

      /* ---- firing ---- */
      p.fireCd -= dt;
      if (g.mode === 'play' && (g.pointer.down || g.reduced) && p.fireCd <= 0) {
        p.fireCd = 0.115;
        fire();
      }

      /* ---- spawn queue ---- */
      for (let i = g.spawnQ.length - 1; i >= 0; i--) {
        if (g.t >= g.spawnQ[i].at) { g.spawnQ[i].make(); g.spawnQ.splice(i, 1); }
      }

      /* ---- enemies ---- */
      for (let i = g.enemies.length - 1; i >= 0; i--) {
        const e = g.enemies[i];
        e.stateT += dt;
        e.flash = Math.max(0, e.flash - dt * 4);
        e.spin += dt * (e.big ? 0.5 : 0.9);

        if (e.state === 'enter') {
          const tX = e.sx, tY = e.sy;
          e.vx = lerp(e.vx, (tX - e.x) * 3.2, 1 - Math.exp(-6 * dt));
          e.vy = lerp(e.vy, (tY - e.y) * 3.2, 1 - Math.exp(-6 * dt));
          e.x += e.vx * dt; e.y += e.vy * dt;
          if (Math.hypot(tX - e.x, tY - e.y) < 12) { e.state = 'hold'; e.stateT = 0; }
        } else if (e.state === 'hold') {
          const sway = Math.sin(g.t * 1.1 + e.phase) * 34;
          const bob = Math.sin(g.t * 1.8 + e.phase * 1.7) * 9;
          const tX = e.sx + sway, tY = e.sy + bob;
          e.vx = lerp(e.vx, (tX - e.x) * 4, 1 - Math.exp(-7 * dt));
          e.vy = lerp(e.vy, (tY - e.y) * 4, 1 - Math.exp(-7 * dt));
          e.x += e.vx * dt; e.y += e.vy * dt;
          e.fireCd -= dt;
          if (e.fireCd <= 0) {
            e.fireCd = e.big ? rand(1.1, 2) : rand(2.2, 5.5) / (1 + g.wave * 0.12);
            enemyFire(e);
          }
          /* dive at the player */
          if (!e.big && Math.random() < dt * 0.12) { e.state = 'dive'; e.stateT = 0; }
        } else if (e.state === 'dive') {
          const dx = g.p.x - e.x, dy = g.p.y - e.y;
          const d = Math.hypot(dx, dy) || 1;
          const acc = 900;
          e.vx += (dx / d) * acc * dt;
          e.vy += (dy / d) * acc * dt;
          const s = Math.hypot(e.vx, e.vy);
          const maxS = 430 + g.wave * 10;
          if (s > maxS) { e.vx = (e.vx / s) * maxS; e.vy = (e.vy / s) * maxS; }
          e.x += e.vx * dt; e.y += e.vy * dt;
          if (Math.random() < dt * 1.5) spark(e.x, e.y + 8, C.red, 1, 40, 0.4, 1.6);
          if (e.stateT > 2.2 || e.y > g.h + 60) { e.state = 'enter'; e.y = -70; e.x = rand(60, g.w - 60); e.vx = 0; e.vy = 0; }
        }

        e.roll = clamp(e.vx * 0.0009, -0.4, 0.4);

        /* body collision with player */
        if (g.mode === 'play' && Math.hypot(e.x - g.p.x, e.y - g.p.y) < e.r + 24) {
          damagePlayer();
          e.hp -= 1;
          e.flash = 1;
          if (e.hp <= 0) { explode(e.x, e.y, C.red, e.big ? 1.6 : 1); g.enemies.splice(i, 1); }
        }
      }

      /* wave cleared */
      if (g.mode === 'play' && g.enemies.length === 0 && g.spawnQ.length === 0) {
        g.waveClearT += dt;
        if (g.waveClearT > 1.1) { g.waveClearT = 0; startWave(g.wave + 1); }
      } else g.waveClearT = 0;

      /* ---- bullets ---- */
      for (let i = g.bullets.length - 1; i >= 0; i--) {
        const b = g.bullets[i];
        b.x += b.vx * dt; b.y += b.vy * dt;
        b.life -= dt;
        if (b.life <= 0 || b.x < -40 || b.x > g.w + 40 || b.y < -40 || b.y > g.h + 40) {
          g.bullets.splice(i, 1); continue;
        }
        if (b.friendly) {
          for (let j = g.enemies.length - 1; j >= 0; j--) {
            const e = g.enemies[j];
            if (Math.hypot(e.x - b.x, e.y - b.y) > e.r) continue;
            e.hp -= 1;
            e.flash = 1;
            spark(b.x, b.y, C.neon, 5, 160, 0.3, 1.8);
            g.bullets.splice(i, 1);
            if (e.hp <= 0) {
              explode(e.x, e.y, e.big ? C.amber : C.red, e.big ? 1.7 : 1);
              g.combo += 1;
              g.comboT = 2;
              const pts = (e.big ? 500 : 100) * Math.max(1, g.combo);
              g.score += pts;
              popup(e.x, e.y - 14, `+${pts}`, e.big ? C.amber : C.neon);
              if (Math.random() < (e.big ? 1 : 0.22)) {
                g.drops.push({ x: e.x, y: e.y, vx: rand(-60, 60), vy: rand(-40, 20), life: 8, r: 7 });
              }
              g.enemies.splice(j, 1);
            }
            break;
          }
        } else if (g.mode === 'play' && Math.hypot(g.p.x - b.x, g.p.y - b.y) < 24 * g.ui) {
          g.bullets.splice(i, 1);
          damagePlayer();
        }
      }

      /* ---- drops (magnet into the tractor beam) ---- */
      for (let i = g.drops.length - 1; i >= 0; i--) {
        const d = g.drops[i];
        d.life -= dt;
        const dx = g.p.x - d.x, dy = g.p.y - d.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 240) {
          const pull = 1500 / dist;
          d.vx += (dx / dist) * pull * dt * 40;
          d.vy += (dy / dist) * pull * dt * 40;
        }
        d.vx *= Math.exp(-1.4 * dt); d.vy *= Math.exp(-1.4 * dt);
        d.x += d.vx * dt; d.y += d.vy * dt;
        if (dist < 30 * g.ui) {
          g.score += 150;
          popup(d.x, d.y, '+150', C.violet);
          spark(d.x, d.y, C.violet, 8, 140, 0.4, 1.8);
          g.drops.splice(i, 1);
          continue;
        }
        if (d.life <= 0) g.drops.splice(i, 1);
      }

      /* ---- combo decay ---- */
      if (g.comboT > 0) { g.comboT -= dt; if (g.comboT <= 0) g.combo = 0; }

      /* ---- particles ---- */
      for (let i = g.parts.length - 1; i >= 0; i--) {
        const q = g.parts[i];
        q.life -= dt;
        if (q.life <= 0) { g.parts.splice(i, 1); continue; }
        if (!q.ring) {
          const k = Math.exp(-q.drag * dt);
          q.vx *= k; q.vy *= k;
          q.vy += 60 * dt;
          q.x += q.vx * dt; q.y += q.vy * dt;
        }
      }

      /* ---- popups ---- */
      for (let i = g.pops.length - 1; i >= 0; i--) {
        const s = g.pops[i];
        s.life -= dt;
        s.y -= 42 * dt;
        if (s.life <= 0) g.pops.splice(i, 1);
      }

      /* ---- global feel ---- */
      g.shake = Math.max(0, g.shake - dt * 1.9);
      g.flashScreen = Math.max(0, g.flashScreen - dt * 2.4);
      if (g.bannerT > 0) g.bannerT -= dt;
      if (g.hintT > 0) g.hintT -= dt;

      /* keep the player inside the viewport */
      p.x = clamp(p.x, 20, g.w - 20);
      p.y = clamp(p.y, 30, g.h - 20);
    };

    /* ── render ──────────────────────────────────────────────────────────── */
    const text = (str, x, y, { size = 12, color = C.neon, align = 'left', weight = '500', alpha = 1, glow = 0 } = {}) => {
      ctx.save();
      ctx.globalAlpha = ctx.globalAlpha * alpha;
      ctx.font = `${weight} ${(size * g.ui).toFixed(2)}px ${MONO}`;
      ctx.textAlign = align;
      ctx.textBaseline = 'alphabetic';
      if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
      ctx.fillStyle = color;
      ctx.fillText(str, x, y);
      ctx.restore();
    };

    const render = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, g.w, g.h);

      const inGame = g.mode !== 'idle';

      /* arcade backdrop: the vignette lives in a CSS layer under the ships
         (see backdropRef), only the letterbox is drawn here */
      if (inGame) {
        const k = clamp(g.introT / 0.6, 0, 1);
        /* letterbox */
        const bar = 26 * k;
        ctx.fillStyle = 'rgba(3,6,12,0.92)';
        ctx.fillRect(0, 0, g.w, bar);
        ctx.fillRect(0, g.h - bar, g.w, bar);
        ctx.fillStyle = `rgba(0,229,160,${0.18 * k})`;
        ctx.fillRect(0, bar - 1, g.w, 1);
        ctx.fillRect(0, g.h - bar, g.w, 1);
      }

      ctx.save();
      g.shakeX = 0; g.shakeY = 0;
      if (g.shake > 0.001) {
        const s = g.shake * g.shake * 16;
        g.shakeX = rand(-s, s); g.shakeY = rand(-s, s);
        ctx.translate(g.shakeX, g.shakeY);
      }

      /* drops */
      ctx.globalCompositeOperation = 'lighter';
      for (const d of g.drops) {
        const pulse = 0.6 + Math.sin(g.t * 8 + d.x) * 0.4;
        ctx.fillStyle = C.violet;
        ctx.globalAlpha = clamp(d.life, 0, 1);
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(g.t * 2.4);
        ctx.fillRect(-4, -4, 8, 8);
        ctx.globalAlpha = clamp(d.life, 0, 1) * 0.3 * pulse;
        ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      /* enemies */
      for (const e of g.enemies) {
        drawSaucer(ctx, {
          x: e.x, y: e.y, scale: e.scale, roll: e.roll, t: g.t + e.phase,
          accent: C.red, foe: true,
          lights: [C.red, C.amber, C.red],
          thrust: e.state === 'dive' ? 1 : 0.25,
          flash: e.flash, spin: e.big ? e.spin * 0.25 : 0, big: e.big,
          solid: !!three,
        });
        if (e.big) {
          const w = 90, hp = e.hp / e.maxHp;
          ctx.fillStyle = 'rgba(255,69,69,0.18)';
          ctx.fillRect(e.x - w / 2, e.y - 52, w, 4);
          ctx.fillStyle = C.red;
          ctx.fillRect(e.x - w / 2, e.y - 52, w * hp, 4);
        }
      }

      /* bullets */
      ctx.globalCompositeOperation = 'lighter';
      for (const b of g.bullets) {
        const col = b.friendly ? C.neon : C.red;
        const ang = Math.atan2(b.vy, b.vx);
        const len = b.friendly ? 22 : 14;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(ang);
        const grd = ctx.createLinearGradient(-len, 0, len * 0.4, 0);
        grd.addColorStop(0, 'rgba(0,0,0,0)');
        grd.addColorStop(1, col);
        ctx.fillStyle = grd;
        ctx.fillRect(-len, -1.6, len * 1.4, 3.2);
        ctx.fillStyle = b.friendly ? '#c8fff0' : '#ffd9d9';
        ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, TAU); ctx.fill();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill();
        ctx.restore();
      }
      ctx.globalCompositeOperation = 'source-over';

      /* player */
      const p = g.p;
      const blink = p.invuln > 0 && Math.floor(g.t * 14) % 2 === 0 ? 0.35 : 1;
      if (g.mode !== 'over') {
        ctx.globalAlpha = blink;
        drawSaucer(ctx, {
          x: p.x, y: p.y, scale: p.scale * g.ui * (1 + g.hover * 0.12),
          roll: p.roll, t: g.t, spin: p.spin,
          accent: C.neon,
          lights: [C.neon, C.blue, C.violet],
          thrust: p.thrust, beam: p.beam, flash: p.flash,
          solid: !!three,
        });
        ctx.globalAlpha = 1;
      }

      /* particles */
      ctx.globalCompositeOperation = 'lighter';
      for (const q of g.parts) {
        const a = clamp(q.life / q.max, 0, 1);
        ctx.globalAlpha = a;
        if (q.ring) {
          const r = q.size * (1 - a) * 1.6 + 6;
          ctx.strokeStyle = q.color;
          ctx.lineWidth = 2.5 * a;
          ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, TAU); ctx.stroke();
        } else {
          ctx.fillStyle = q.color;
          ctx.beginPath(); ctx.arc(q.x, q.y, q.size * a, 0, TAU); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      /* score popups */
      for (const s of g.pops) {
        const a = clamp(s.life / s.max, 0, 1);
        text(s.text, s.x, s.y, { size: 13, color: s.color, align: 'center', weight: '700', alpha: a, glow: 8 });
      }

      ctx.restore();

      /* idle hover prompt */
      if (g.mode === 'idle' && g.hover > 0.01) {
        const y = p.y + 46;
        ctx.globalAlpha = g.hover;
        text('▸ PLAY', p.x, y, { size: 11, color: C.neon, align: 'center', weight: '700', glow: 10 });
        text('click to engage', p.x, y + 14, { size: 9, color: C.dim, align: 'center' });
        ctx.globalAlpha = 1;
      }

      /* ── HUD ── */
      if (inGame) {
        const k = clamp(g.introT / 0.6, 0, 1);
        ctx.globalAlpha = k;
        const pad = 22;
        text('SCORE', pad, 52, { size: 9, color: C.dim, weight: '600' });
        text(String(g.score).padStart(6, '0'), pad, 72, { size: 20, color: C.neon, weight: '700', glow: 12 });
        text(`HI ${String(g.hi).padStart(6, '0')}`, pad, 88, { size: 9, color: C.dim, weight: '600' });

        text(`WAVE ${String(g.wave).padStart(2, '0')}`, g.w / 2, 52, { size: 12, color: C.blue, align: 'center', weight: '700', glow: 8 });

        text('SHIELDS', g.w - pad, 52, { size: 9, color: C.dim, align: 'right', weight: '600' });
        for (let i = 0; i < 3; i++) {
          const on = i < g.p.shields;
          ctx.fillStyle = on ? C.neon : 'rgba(71,85,105,0.35)';
          ctx.globalAlpha = k * (on ? 1 : 0.6);
          ctx.fillRect(g.w - pad - 12 - i * 16, 62, 12, 10);
        }
        ctx.globalAlpha = k;

        if (g.combo > 1) {
          const punch = 1 + clamp(g.comboT - 1.7, 0, 0.3) * 2;
          text(`x${g.combo}`, g.p.x, g.p.y - 44, {
            size: 15 * punch, color: C.amber, align: 'center', weight: '700', glow: 10,
            alpha: clamp(g.comboT, 0, 1),
          });
        }

        if (g.hintT > 0) {
          const a = clamp(g.hintT, 0, 1) * k;
          const hint = g.narrow
            ? 'ARRASTE para mover    SEGURE para atirar'
            : 'MOVE  mouse / touch      FIRE  hold      EXIT  esc';
          text(hint, g.w / 2, g.h - 40, {
            size: 10, color: C.dim, align: 'center', alpha: a, weight: '600',
          });
        }

        if (g.bannerT > 0) {
          const a = clamp(g.bannerT / 0.5, 0, 1);
          const grow = 1 + (1 - clamp(g.bannerT / 1.6, 0, 1)) * 0.08;
          text(g.banner, g.w / 2, g.h * 0.42, {
            size: 40 * grow, color: C.neon, align: 'center', weight: '700', alpha: a, glow: 18,
          });
        }

        if (g.mode === 'over') {
          const a = clamp(g.overT / 0.6, 0, 1);
          ctx.fillStyle = `rgba(3,7,14,${0.72 * a})`;
          ctx.fillRect(0, 0, g.w, g.h);
          text('SIGNAL LOST', g.w / 2, g.h * 0.42, { size: 42, color: C.red, align: 'center', weight: '700', alpha: a, glow: 20 });
          text(`SCORE ${String(g.score).padStart(6, '0')}`, g.w / 2, g.h * 0.42 + 40, { size: 15, color: C.neon, align: 'center', weight: '700', alpha: a });
          text(`HI ${String(g.hi).padStart(6, '0')}`, g.w / 2, g.h * 0.42 + 62, { size: 11, color: C.dim, align: 'center', alpha: a });
          if (g.overT > 0.9) {
            const bl = 0.45 + Math.sin(g.t * 4) * 0.55;
            text('CLICK TO RETRY   ·   ESC TO LEAVE', g.w / 2, g.h * 0.42 + 100, {
              size: 11, color: C.white, align: 'center', weight: '600', alpha: a * bl,
            });
          }
        }

        /* scanlines */
        ctx.globalAlpha = 0.055 * k;
        ctx.fillStyle = '#0affc0';
        for (let y = 0; y < g.h; y += 4) ctx.fillRect(0, y, g.w, 1);
        ctx.globalAlpha = 1;
      }

      /* screen flash */
      if (g.flashScreen > 0.001) {
        ctx.fillStyle = `rgba(200,255,238,${g.flashScreen * 0.35})`;
        ctx.fillRect(0, 0, g.w, g.h);
      }
    };

    /* ── main loop ───────────────────────────────────────────────────────── */
    let raf = 0;
    let last = performance.now();
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 1 / 20) dt = 1 / 20;   // never let a stall teleport anything

      /* hit-stop: brief slow-mo on kills, then ease back to full speed */
      if (g.hitStop > 0) {
        g.hitStop -= dt;
        g.timeScale = 0.22;
      } else {
        g.timeScale = lerp(g.timeScale, 1, 1 - Math.exp(-14 * dt));
      }

      update(dt * g.timeScale);
      stepLetters(dt);
      render();
      if (three) three.render(g, dt, g.shakeX, g.shakeY);
      if (backdropRef.current) {
        backdropRef.current.style.opacity = g.mode === 'idle' ? '0' : clamp(g.introT / 0.6, 0, 1).toFixed(3);
      }

      /* keep the invisible hitbox glued to the saucer */
      if (hit) {
        hit.style.transform = `translate3d(${(g.p.x - 46 * g.ui).toFixed(1)}px, ${(g.p.y - 29 * g.ui).toFixed(1)}px, 0)`;
      }
    };
    raf = requestAnimationFrame(frame);

    const onVis = () => { last = performance.now(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      disposed = true;
      if (three) three.dispose();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('resize', resize);
      document.removeEventListener('click', onClickLetter);
      document.removeEventListener('visibilitychange', onVis);
      for (const el of letterEls()) { clearLetter(el); el.style.opacity = ''; }
      if (hit) {
        hit.removeEventListener('pointerenter', onHitEnter);
        hit.removeEventListener('pointerleave', onHitLeave);
        hit.removeEventListener('click', onHitClick);
      }
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0"
        style={{
          zIndex: arcade ? 9000 : 40,
          pointerEvents: 'none',
          opacity: 0,
          background: 'radial-gradient(ellipse at center, rgba(5,11,20,0) 25%, rgba(3,7,14,0.82) 95%)',
        }}
        aria-hidden="true"
      />
      <canvas
        ref={glRef}
        className="fixed inset-0"
        style={{ zIndex: arcade ? 9000 : 40, pointerEvents: 'none', width: '100%', height: '100%' }}
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0"
        style={{
          zIndex: arcade ? 9000 : 40,
          pointerEvents: arcade ? 'auto' : 'none',
          touchAction: 'none',
        }}
        aria-hidden="true"
      />
      {/* hitbox that rides along with the saucer */}
      <button
        ref={hitRef}
        type="button"
        className="fixed top-0 left-0 rounded-full"
        style={{
          width: 92, height: 58,
          zIndex: 41,
          pointerEvents: arcade ? 'none' : 'auto',
          willChange: 'transform',
        }}
        title={t('ufoPlay')}
        aria-label={t('ufoPlay')}
        onClick={dismissHint}
      >
        {showHint && !arcade && (
          <span
            className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-neon/30 bg-card/90 px-2.5 py-1 font-mono text-[10px] text-neon/80 backdrop-blur-sm"
            style={{ animation: 'ufo-hint 0.4s ease-out both' }}
          >
            {t('ufoHint')}
          </span>
        )}
      </button>
    </>
  );
}
