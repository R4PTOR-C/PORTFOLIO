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
             auto-aimed guns, sectors of four waves and a boss, four foe
             types, weapon capsules (spread / laser / homing, three levels
             each), bombs, and an upgrade pick after every boss. ESC exits.
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
  magenta: '#ff2bd6',
};

/* ── arcade content ─────────────────────────────────────────────────────────
   A run is a string of sectors: four waves, then a boss. Beating the boss
   lets you bolt one upgrade onto the saucer for the rest of the run, and
   capsules dropped by foes swap or level the gun, the way the old vertical
   shooters did it. */
const WAVES_PER_SECTOR = 4;
const pad2 = (n) => String(n).padStart(2, '0');

const WEAPONS = {
  twin:   { name: 'TWIN',   color: '#00e5a0', core: '#c8fff0' },
  spread: { name: 'SPREAD', color: '#ff9d2e', core: '#ffe2bd' },
  laser:  { name: 'LASER',  color: '#4cc9ff', core: '#e0f7ff' },
  homing: { name: 'HOMING', color: '#ff2bd6', core: '#ffd0f5' },
};

/* capsule letter → effect (weapon letters swap the gun, or level it up if
   it is the one you already carry) */
const CAPS = {
  S: { color: WEAPONS.spread.color, weapon: 'spread' },
  L: { color: WEAPONS.laser.color, weapon: 'laser' },
  M: { color: WEAPONS.homing.color, weapon: 'homing' },
  P: { color: '#ffe066' },
  '+': { color: '#00e5a0' },
  B: { color: '#ff4545' },
};

const FOES = {
  grunt:  { hp: 1,  scale: 0.78, r: 26, pts: 100, color: '#ff4545' },  // holds formation, dives at you
  dart:   { hp: 1,  scale: 0.58, r: 20, pts: 150, color: '#ff2bd6' },  // streams straight down
  gunner: { hp: 4,  scale: 0.92, r: 30, pts: 300, color: '#ff9d2e' },  // aimed bursts
  tank:   { hp: 10, scale: 1.12, r: 38, pts: 600, color: '#a78bfa' },  // bullet rings
};

const BOSS_NAMES = ['MOTHERSHIP', 'HARVESTER', 'OVERSEER', 'LEVIATHAN'];
/* each boss cycles its patterns in its own order */
const BOSS_PATTERNS = [
  ['fan', 'spiral', 'summon', 'ring'],
  ['ring', 'fan', 'spiral', 'summon'],
  ['spiral', 'ring', 'fan', 'summon'],
];

const UPGRADES = [
  { id: 'rate',   icon: '»', max: 3, pt: ['Overclock', 'Atira 25% mais rápido'], en: ['Overclock', 'Fire 25% faster'] },
  { id: 'hull',   icon: '◆', max: 3, pt: ['Casco reforçado', 'Um escudo a mais, e todos recarregados'], en: ['Reinforced hull', 'One more shield, all of them recharged'] },
  { id: 'drone',  icon: '◎', max: 2, pt: ['Drone de escolta', 'Um drone orbita a nave e atira junto'], en: ['Escort drone', 'A drone orbits the ship and fires with it'] },
  { id: 'dmg',    icon: '✦', max: 3, pt: ['Munição pesada', 'Cada tiro causa 35% mais dano'], en: ['Heavy rounds', 'Every shot hits 35% harder'] },
  { id: 'magnet', icon: '∪', max: 2, pt: ['Feixe trator', 'Puxa cápsulas e cristais de mais longe'], en: ['Tractor beam', 'Pulls capsules and gems from further away'] },
  { id: 'bomb',   icon: '✺', max: 3, pt: ['Paiol', 'Uma bomba a mais, e o paiol cheio'], en: ['Magazine', 'One more bomb, magazine refilled'] },
  { id: 'regen',  icon: '↻', max: 2, pt: ['Nanorreparo', 'Recupera um escudo sozinho a cada 20 s'], en: ['Nano-repair', 'Regain a shield on its own every 20 s'] },
  { id: 'keep',   icon: '▲', max: 1, pt: ['Núcleo estável', 'Levar dano não rebaixa mais a arma'], en: ['Stable core', 'Taking hits no longer downgrades your gun'] },
];

const TXT = {
  pt: {
    clear: 'SETOR LIMPO', pick: 'ESCOLHA UM UPGRADE', keys: 'clique num card ou tecle 1 · 2 · 3', tap: 'toque num card', lvl: 'NÍVEL',
    wide: 'MOVER mouse     ATIRAR segure     BOMBA espaço / botão direito     SAIR esc',
    narrow: 'ARRASTE move · SEGURE atira · 2 DEDOS bomba',
  },
  en: {
    clear: 'SECTOR CLEAR', pick: 'CHOOSE AN UPGRADE', keys: 'click a card or press 1 · 2 · 3', tap: 'tap a card', lvl: 'LEVEL',
    wide: 'MOVE mouse     FIRE hold     BOMB space / right click     EXIT esc',
    narrow: 'DRAG move · HOLD fire · 2 FINGERS bomb',
  },
};

/* the arcade backdrop shifts hue a little each sector */
const TINTS = ['3,7,14', '14,4,22', '2,14,16', '18,8,4'];

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
  const { t, i18n } = useTranslation();
  const langRef = useRef('pt');
  useEffect(() => { langRef.current = i18n.language || 'pt'; }, [i18n.language]);
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
        maxShields: 3, bombs: 2, maxBombs: 2, weapon: 'twin', wlvl: 1,
        regenT: 0, droneA: 0, droneTick: false, aim: -Math.PI / 2, muzzle: 0,
      },
      bullets: [], enemies: [], parts: [], pops: [], drops: [],
      score: 0, hi: 0, combo: 0, comboT: 0,
      wave: 0, waveClearT: 0, spawnQ: [],
      sector: 1, kills: 0, capPity: 0, up: {}, boss: null,
      cards: [], pickT: 0, toUpgrade: 0, chain: null, warnT: 0, tintSector: 0,
      banner: '', bannerC: C.neon, bannerT: 0, introT: 0, overT: 0, hintT: 0,
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
    /* Booting three.js blocks the main thread for a few hundred ms. On the
       first visit the loader curtain hides that; on a reload it would land
       on top of the badge drop, so wait until the page has settled. */
    let bootTimer = 0;
    const startThree = () => {
      if (disposed || !glRef.current) return;
      import('./ufoShips3d')
        .then(({ createShipLayer }) => createShipLayer(glRef.current))
        .then((layer) => {
          if (disposed) { layer.dispose(); return; }
          three = layer;
          three.resize(g.w, g.h, dpr);
        })
        .catch(() => { /* keep the sprite */ });
    };
    if (glRef.current) {
      if (document.documentElement.classList.contains('ufo-boot')) startThree();
      else bootTimer = setTimeout(() => (window.requestIdleCallback || setTimeout)(startThree, { timeout: 1500 }), 2200);
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
        if (document.documentElement.classList.contains('ufo-boot')) {
          return { x: g.w * 0.5, y: -140 };   // wait off-screen while the loader plays
        }
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
      /* coming out of the loader: enter from above the viewport */
      if (document.documentElement.classList.contains('ufo-boot')) { g.p.x = g.w * 0.5; g.p.y = -140; }
    }

    /* ── run / sectors ───────────────────────────────────────────────────── */
    const lv = (id) => g.up[id] || 0;
    const langKey = () => (String(langRef.current).startsWith('en') ? 'en' : 'pt');
    const banner = (str, color = C.neon, time = 1.6) => { g.banner = str; g.bannerC = color; g.bannerT = time; };

    const resetRun = () => {
      g.score = 0; g.combo = 0; g.comboT = 0; g.wave = 0; g.waveClearT = 0;
      g.sector = 1; g.kills = 0; g.capPity = 0; g.up = {}; g.boss = null;
      g.cards = []; g.toUpgrade = 0; g.chain = null; g.warnT = 0;
      g.bullets.length = 0; g.enemies.length = 0; g.drops.length = 0; g.spawnQ.length = 0;
      Object.assign(g.p, {
        shields: 3, maxShields: 3, bombs: 2, maxBombs: 2,
        weapon: 'twin', wlvl: 1, regenT: 0, flash: 0, beam: 0,
      });
    };

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

    /* foes get tougher every sector */
    const mkFoe = (kind, o) => {
      const f = FOES[kind];
      const hp = Math.round(f.hp * (1 + (g.sector - 1) * 0.6));
      g.enemies.push({
        kind, pal: kind === 'grunt' ? 'foe' : kind,
        x: 0, y: 0, vx: 0, vy: 0, sx: 0, sy: 0,
        phase: rand(0, TAU), state: 'enter', stateT: 0,
        hp, maxHp: hp, r: f.r * g.ui, scale: f.scale * g.ui, spin: 0,
        fireCd: rand(1.4, 4), flash: 0, big: false, roll: 0, burst: 0, burstT: 0,
        ...o,
      });
    };

    const startBoss = () => {
      g.wave = WAVES_PER_SECTOR + 1;
      g.warnT = 2.4;
      banner('WARNING', C.red, 2.4);
      g.spawnQ.push({
        at: g.t + 2.4,
        make: () => {
          const s = g.sector;
          const hp = Math.round(150 * (1 + (s - 1) * 0.8));
          const boss = {
            kind: 'boss', pal: 'boss', name: `${BOSS_NAMES[(s - 1) % BOSS_NAMES.length]}-${pad2(s)}`,
            x: g.w * 0.5, y: -140, vx: 0, vy: 0, sx: g.w * 0.5, sy: Math.min(170, g.h * 0.24),
            phase: 0, state: 'enter', stateT: 0,
            hp, maxHp: hp, r: 58 * g.ui, scale: (1.6 + Math.min(0.4, (s - 1) * 0.1)) * g.ui, spin: 0,
            fireCd: 1, flash: 0, big: true, roll: 0,
            pat: 0, patT: 0, emitA: 0, rage: false,
          };
          g.enemies.push(boss);
          g.boss = boss;
        },
      });
    };

    const startWave = (n) => {
      if (n > WAVES_PER_SECTOR) { startBoss(); return; }
      g.wave = n;
      const s = g.sector;
      banner(n === 1 ? `SECTOR ${pad2(s)}` : `WAVE ${n}/${WAVES_PER_SECTOR}`, n === 1 ? C.neon : C.blue);
      const count = Math.min(16, 3 + n * 2 + s);
      const kinds = [];
      for (let i = 0; i < count; i++) {
        const r = Math.random();
        if ((s >= 2 || n >= 4) && r > 0.93 - s * 0.03) kinds.push('tank');
        else if ((s >= 2 || n >= 3) && r < 0.2 + s * 0.05) kinds.push('gunner');
        else kinds.push('grunt');
      }
      /* the heavies take the back row */
      const rank = { tank: 0, gunner: 1, grunt: 2 };
      kinds.sort((a, b) => rank[a] - rank[b]);
      kinds.forEach((kind, i) => {
        const { sx, sy } = slotPos(i, count);
        const fromLeft = i % 2 === 0;
        g.spawnQ.push({
          at: g.t + 0.7 + i * 0.13,
          make: () => mkFoe(kind, { x: fromLeft ? -80 : g.w + 80, y: rand(60, g.h * 0.4), sx, sy }),
        });
      });
      /* darts: short streams that cut straight down the screen */
      if (n >= 2 || s >= 2) {
        const streams = Math.min(4, 1 + Math.floor((n + s) / 3));
        for (let k = 0; k < streams; k++) {
          const x = rand(0.15, 0.85) * g.w;
          for (let i = 0; i < 4; i++) {
            g.spawnQ.push({
              at: g.t + 3 + k * 2.6 + i * 0.22,
              make: () => mkFoe('dart', { x: x + rand(-14, 14), y: -60, vy: 240, state: 'dart' }),
            });
          }
        }
      }
    };

    const nextSector = () => {
      g.sector += 1;
      g.wave = 0;               // the wave-clear timer starts sector n+1
      g.waveClearT = 0;
      g.mode = 'play';
    };

    const openUpgrade = () => {
      const pool = UPGRADES.filter((u) => lv(u.id) < u.max);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      g.cards = pool.slice(0, 3).map((u) => ({ u, rect: null }));
      if (!g.cards.length) { nextSector(); return; }
      g.mode = 'upgrade';
      g.pickT = 0;
      g.pointer.down = false;
    };

    const pickUpgrade = (i) => {
      const c = g.cards[i];
      if (!c || g.pickT < 0.45) return;
      const p = g.p;
      const id = c.u.id;
      g.up[id] = lv(id) + 1;
      if (id === 'hull') p.maxShields += 1;
      if (id === 'bomb') { p.maxBombs += 1; p.bombs = p.maxBombs; }
      p.shields = id === 'hull' ? p.maxShields : Math.min(p.maxShields, p.shields + 1);
      p.invuln = 1.2;
      g.cards = [];
      spark(p.x, p.y, C.neon, 30, 300, 0.8, 2.4);
      shockwave(p.x, p.y, C.neon, 110);
      popup(p.x, p.y - 50, c.u[langKey()][0].toUpperCase(), C.neon);
      nextSector();
    };

    const cardAt = (x, y) => g.cards.findIndex(({ rect: r }) => r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);

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
      resetRun();
      g.p.invuln = 1.2;
      g.hintT = 6;
      g.hoverTarget = 0;               // the hitbox goes inert, so no leave event
      banner('ARCADE MODE', C.neon, 0.9);
      spark(g.p.x, g.p.y, C.neon, 26, 260, 0.8, 2.2);
      shockwave(g.p.x, g.p.y, C.neon, 90);
      setArcade(true);
      document.body.style.overflow = 'hidden';
    };

    const exitArcade = () => {
      if (g.mode === 'idle') return;
      g.mode = 'idle';
      g.bullets.length = 0; g.enemies.length = 0; g.drops.length = 0; g.spawnQ.length = 0;
      g.cards = []; g.boss = null; g.toUpgrade = 0; g.chain = null; g.warnT = 0;
      g.banner = ''; g.bannerT = 0;
      setArcade(false);
      document.body.style.overflow = '';
    };

    const restart = () => {
      g.mode = 'intro';
      g.introT = 0.45;                 // keep the letterbox up, skip the boot beat
      resetRun();
      g.p.invuln = 1.4;
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
    const touches = new Set();
    const onPointerMove = (e) => {
      if (e.pointerType === 'touch' && !e.isPrimary) return;   // a second finger is the bomb, not the stick
      g.pointer.rx = e.clientX;
      g.pointer.ry = e.clientY;
      g.pointer.x = e.clientX;
      /* On touch the pointer IS the finger — fly the saucer above it so the
         hand does not cover the ship or the shots coming up from below. */
      g.pointer.y = e.clientY - (e.pointerType === 'mouse' ? 0 : 74);
      g.pointer.seen = true;
    };
    const onPointerDown = (e) => {
      if (e.pointerType === 'touch') touches.add(e.pointerId);
      if (g.mode === 'play' || g.mode === 'intro') {
        if (e.button === 2 || touches.size >= 2) { bomb(); return; }
        g.pointer.down = true;
        onPointerMove(e);
      } else if (g.mode === 'upgrade') {
        const i = cardAt(e.clientX, e.clientY);
        if (i >= 0) pickUpgrade(i);
      } else if (g.mode === 'over' && g.overT > 0.9) restart();
    };
    const onPointerUp = (e) => {
      touches.delete(e.pointerId);
      if (!touches.size) g.pointer.down = false;
    };
    const onScroll = () => {
      const y = window.scrollY;
      g.scrollVel = y - g.scrollY;
      g.scrollY = y;
      g.docH = Math.max(1, document.documentElement.scrollHeight - g.h);
    };
    const onKey = (e) => {
      if (e.key === 'Escape' && g.mode !== 'idle') exitArcade();
      else if (g.mode === 'play' && (e.code === 'Space' || e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        if (!e.repeat) bomb();
      } else if (g.mode === 'upgrade' && ['1', '2', '3'].includes(e.key)) pickUpgrade(Number(e.key) - 1);
    };
    const onContext = (e) => { if (g.mode !== 'idle') e.preventDefault(); };
    const onBlur = () => { g.pointer.down = false; touches.clear(); };
    const onClickLetter = (e) => {
      const el = e.target.closest && e.target.closest('[data-ufo-letter]');
      if (el) startAbduct(el);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('contextmenu', onContext);
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

    /* ── combat ──────────────────────────────────────────────────────────── */
    const nearestEnemy = (x = g.p.x, y = g.p.y) => {
      let best = null, bd = Infinity;
      for (const e of g.enemies) {
        if (e.state === 'dead' || e.y < -20) continue;
        const d = (e.x - x) ** 2 + (e.y - y) ** 2;
        if (d < bd) { bd = d; best = e; }
      }
      return best;
    };

    const dronePos = (i) => {
      const a = g.p.droneA + i * Math.PI;
      return { x: g.p.x + Math.cos(a) * 58 * g.ui, y: g.p.y + Math.sin(a) * 26 * g.ui };
    };

    const fire = () => {
      const p = g.p;
      const wpn = WEAPONS[p.weapon];
      const L = p.wlvl;
      const dm = 1 + lv('dmg') * 0.35;
      const A = p.aim;
      const ca = Math.cos(A), sa = Math.sin(A);
      /* shots leave from the muzzles of the 3D turret (see ufoShips3d):
         S is one model unit in px; looking down, depth is foreshortened */
      const S = 40 * p.scale * g.ui;
      const reach = (p.weapon === 'homing' ? 0.95 : p.weapon === 'spread' ? 1.2 : 1.42) * S;
      const ox = p.x + ca * reach, oy = p.y + sa * reach * 0.88 - 0.11 * S;
      /* off = sideways offset across the aim line */
      const shot = (off, ang, speed, o) => g.bullets.push({
        x: ox - sa * off, y: oy + ca * off,
        vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
        life: 1.4, friendly: true, r: 5, dmg: dm, color: wpn.color, core: wpn.core, ...o,
      });
      let cd = 0.115;
      if (p.weapon === 'twin') {
        for (const off of [[-0.16, 0.16], [-0.2, 0, 0.2], [-0.27, -0.09, 0.09, 0.27]][L - 1]) shot(off * S, A, 1000);
      } else if (p.weapon === 'spread') {
        cd = 0.17;
        const n = [3, 5, 7][L - 1];
        for (let i = 0; i < n; i++) shot(0, A + (i - (n - 1) / 2) * 0.16, 900, { dmg: dm * 0.9 });
      } else if (p.weapon === 'laser') {
        /* pierces: one bolt can hit every foe on its line, once each */
        cd = 0.08;
        for (const off of [[0], [-0.13, 0.13], [-0.22, 0, 0.22]][L - 1].map((o) => o * S)) {
          shot(off, A, 1700, { dmg: dm * 1.1, style: 'laser', pierce: true, hit: new Set(), r: 7 });
        }
      } else if (p.weapon === 'homing') {
        cd = [0.34, 0.27, 0.22][L - 1];
        const n = L === 3 ? 4 : 2;
        for (let i = 0; i < n; i++) {
          const side = i % 2 ? 1 : -1;
          const fan = 1 + Math.floor(i / 2) * 0.45;
          shot(side * 0.56 * S, A + side * fan, 360, { dmg: dm * 2.4, style: 'missile', homing: true, life: 2.6, r: 7 });
        }
      }
      /* escort drones chip in every other volley */
      p.droneTick = !p.droneTick;
      if (p.droneTick) {
        for (let i = 0; i < lv('drone'); i++) {
          const d = dronePos(i);
          const tg = nearestEnemy(d.x, d.y);
          const a = tg ? Math.atan2(tg.y - d.y, tg.x - d.x) : -Math.PI / 2;
          g.bullets.push({
            x: d.x, y: d.y, vx: Math.cos(a) * 950, vy: Math.sin(a) * 950,
            life: 1.4, friendly: true, r: 5, dmg: dm * 0.7, color: C.violet, core: '#efe6ff',
          });
        }
      }
      p.fireCd = cd / (1 + lv('rate') * 0.25);
      p.muzzle = 1;
      spark(ox, oy, wpn.color, 3, 90, 0.2, 1.4);
      addShake(0.04);
    };

    const shootFoe = (x, y, ang, speed, style = 'dart', r = 6, color = C.red) => {
      g.bullets.push({ x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 6, friendly: false, r, style, color });
    };
    const aimAt = (e) => Math.atan2(g.p.y - e.y, g.p.x - e.x);
    const diff = () => 1 + (g.sector - 1) * 0.25 + g.wave * 0.05;

    const foeFire = (e) => {
      const d = diff();
      if (e.kind === 'gunner') {
        e.burst = 3; e.burstT = 0;
        e.fireCd = rand(2, 3.2) / d;
      } else if (e.kind === 'tank') {
        const n = g.sector >= 3 ? 14 : 10;
        const off = rand(0, TAU);
        for (let i = 0; i < n; i++) shootFoe(e.x, e.y, off + (i / n) * TAU, 160 + g.sector * 10, 'orb', 7, C.violet);
        e.fireCd = rand(2.8, 3.8) / d;
      } else {
        shootFoe(e.x, e.y + 8, aimAt(e), 250 + g.sector * 18);
        e.fireCd = rand(2.4, 5.5) / d;
      }
    };

    /* the boss sways across the top and cycles bullet patterns; under half
       health it goes into overdrive: faster, denser, one more spiral arm */
    const stepBoss = (e, dt) => {
      if (!e.rage && e.hp < e.maxHp * 0.5) {
        e.rage = true;
        banner('OVERDRIVE', C.amber, 1.2);
        addShake(0.6);
        shockwave(e.x, e.y, C.red, 130);
      }
      const k = e.rage ? 0.68 : 1;
      const tX = g.w * 0.5 + Math.sin(g.t * 0.45) * g.w * 0.28;
      const tY = e.sy + Math.sin(g.t * 0.9) * 18;
      e.vx = lerp(e.vx, (tX - e.x) * 2, 1 - Math.exp(-3 * dt));
      e.vy = lerp(e.vy, (tY - e.y) * 2, 1 - Math.exp(-3 * dt));
      e.x += e.vx * dt; e.y += e.vy * dt;

      const order = BOSS_PATTERNS[(g.sector - 1) % BOSS_PATTERNS.length];
      const span = 3.6 * k;
      e.patT += dt;
      if (e.patT > span + 0.7) { e.patT = 0; e.pat = (e.pat + 1) % order.length; e.fireCd = 0.3; }
      e.fireCd -= dt;
      if (e.fireCd > 0 || e.patT > span) return;          // breather between patterns
      const sp = (190 + g.sector * 14) * (e.rage ? 1.12 : 1);
      const pat = order[e.pat];
      if (pat === 'fan') {
        e.fireCd = 0.62 * k;
        const n = e.rage ? 9 : 7;
        const a = aimAt(e);
        for (let i = 0; i < n; i++) shootFoe(e.x, e.y + 20, a + (i - (n - 1) / 2) * 0.16, sp * 1.2, 'dart', 6, C.red);
      } else if (pat === 'spiral') {
        e.fireCd = 0.11 * k;
        const arms = e.rage ? 4 : 3;
        e.emitA += 0.27;
        for (let i = 0; i < arms; i++) shootFoe(e.x, e.y, e.emitA + (i / arms) * TAU, sp * 0.85, 'orb', 6, C.magenta);
      } else if (pat === 'ring') {
        e.fireCd = 0.95 * k;
        const n = e.rage ? 24 : 18;
        e.emitA += Math.PI / n;
        for (let i = 0; i < n; i++) shootFoe(e.x, e.y, e.emitA + (i / n) * TAU, sp * 0.8, 'orb', 7, C.amber);
      } else {
        e.fireCd = 1.1 * k;
        for (const side of [-1, 1]) mkFoe('dart', { x: e.x + side * 70 * g.ui, y: e.y + 10, vy: 120, state: 'dart' });
        const a = aimAt(e);
        for (let i = -1; i <= 1; i++) shootFoe(e.x, e.y + 20, a + i * 0.2, sp, 'dart', 6, C.red);
      }
    };

    const dropCap = (x, y) => {
      const p = g.p;
      const weights = [
        ['S', p.weapon === 'spread' ? 0.5 : 1],
        ['L', p.weapon === 'laser' ? 0.5 : 1],
        ['M', p.weapon === 'homing' ? 0.5 : 1],
        ['P', p.wlvl < 3 ? 1.3 : 0.3],
        ['+', p.shields < p.maxShields ? 1.3 : 0.2],
        ['B', p.bombs < p.maxBombs ? 0.7 : 0.1],
      ];
      let r = Math.random() * weights.reduce((a, [, v]) => a + v, 0);
      let letter = 'P';
      for (const [key, v] of weights) { r -= v; if (r <= 0) { letter = key; break; } }
      g.drops.push({ kind: 'cap', letter, x, y, vx: rand(-50, 50), vy: -90, life: 12, r: 12, ph: rand(0, TAU) });
    };

    const applyCap = (d) => {
      const p = g.p;
      const c = CAPS[d.letter];
      let label;
      if (c.weapon) {
        if (p.weapon === c.weapon) {
          if (p.wlvl < 3) p.wlvl += 1; else g.score += 1000;
        } else p.weapon = c.weapon;
        label = `${WEAPONS[p.weapon].name} ${'I'.repeat(p.wlvl)}`;
      } else if (d.letter === 'P') {
        if (p.wlvl < 3) { p.wlvl += 1; label = 'POWER UP'; } else { g.score += 1000; label = '+1000'; }
      } else if (d.letter === '+') {
        if (p.shields < p.maxShields) { p.shields += 1; label = 'SHIELD +1'; } else { g.score += 500; label = '+500'; }
      } else {
        if (p.bombs < p.maxBombs) { p.bombs += 1; label = 'BOMB +1'; } else { g.score += 500; label = '+500'; }
      }
      popup(d.x, d.y - 12, label, c.color);
      spark(d.x, d.y, c.color, 14, 200, 0.5, 2);
      shockwave(d.x, d.y, c.color, 44);
    };

    const killBoss = (e) => {
      g.boss = null;
      const pts = 5000 * g.sector;
      g.score += pts;
      popup(e.x, e.y - 40, `+${pts}`, C.amber);
      for (let i = g.bullets.length - 1; i >= 0; i--) if (!g.bullets[i].friendly) g.bullets.splice(i, 1);
      for (const o of g.enemies.splice(0)) explode(o.x, o.y, C.magenta, 1);
      g.chain = { x: e.x, y: e.y, n: 9, t: 0 };
      explode(e.x, e.y, C.amber, 2.2);
      addShake(1);
      g.flashScreen = 0.7;
      if (!g.reduced) g.hitStop = 0.35;
      dropCap(e.x, e.y);
      for (let i = 0; i < 5; i++) {
        g.drops.push({ kind: 'gem', x: e.x + rand(-40, 40), y: e.y + rand(-20, 20), vx: rand(-140, 140), vy: rand(-140, 40), life: 9, r: 7 });
      }
      g.toUpgrade = 2.6;
      banner('SECTOR CLEAR', C.amber, 2.2);
    };

    const killFoe = (e) => {
      const i = g.enemies.indexOf(e);
      if (i >= 0) g.enemies.splice(i, 1);
      g.combo += 1;
      g.comboT = 2;
      g.kills += 1;
      if (e.kind === 'boss') { killBoss(e); return; }
      const f = FOES[e.kind];
      explode(e.x, e.y, f.color, e.kind === 'tank' ? 1.4 : 1);
      const pts = f.pts * Math.max(1, g.combo);
      g.score += pts;
      popup(e.x, e.y - 14, `+${pts}`, C.neon);
      if (Math.random() < (e.kind === 'tank' ? 1 : 0.22)) {
        g.drops.push({ kind: 'gem', x: e.x, y: e.y, vx: rand(-60, 60), vy: rand(-40, 20), life: 8, r: 7 });
      }
      /* capsules: heavier foes drop more, and a dry spell is never too long */
      g.capPity += 1;
      const chance = { grunt: 0.05, dart: 0.04, gunner: 0.22, tank: 0.6 }[e.kind];
      if (Math.random() < chance || g.capPity >= 16) { dropCap(e.x, e.y); g.capPity = 0; }
    };

    const hurt = (e, dmg) => {
      e.hp -= dmg;
      /* the boss is hit nonstop; a full flash every time would bleach it white */
      e.flash = e.kind === 'boss' ? Math.max(e.flash, 0.25) : 1;
      if (e.hp <= 0) killFoe(e);
    };

    /* clears every enemy shot on screen and hits everything */
    const bomb = () => {
      const p = g.p;
      if (g.mode !== 'play' || p.bombs <= 0) return;
      p.bombs -= 1;
      let n = 0;
      for (let i = g.bullets.length - 1; i >= 0; i--) {
        const b = g.bullets[i];
        if (b.friendly) continue;
        if (n++ < 60) spark(b.x, b.y, C.amber, 1, 60, 0.4, 1.6);
        g.bullets.splice(i, 1);
      }
      const dm = 1 + lv('dmg') * 0.35;
      for (const e of [...g.enemies]) hurt(e, e.kind === 'boss' ? e.maxHp * 0.08 : 14 * dm);
      const R = Math.max(g.w, g.h);
      shockwave(p.x, p.y, C.white, R);
      shockwave(p.x, p.y, C.neon, R * 0.6);
      g.flashScreen = 0.45;
      addShake(0.9);
      p.invuln = Math.max(p.invuln, 1);
      banner('BOMB', C.white, 0.6);
    };

    const damagePlayer = () => {
      const p = g.p;
      if (p.invuln > 0 || g.mode !== 'play') return;
      p.shields -= 1;
      p.invuln = 1.5;
      p.flash = 1;
      g.combo = 0;
      if (!lv('keep')) p.wlvl = Math.max(1, p.wlvl - 1);
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

      /* ---- aim + firing ---- */
      if (g.mode === 'play' || g.mode === 'upgrade') {
        const tg = nearestEnemy();
        p.aim = tg ? Math.atan2(tg.y - p.y, tg.x - p.x) : -Math.PI / 2;
      }
      p.muzzle = Math.max(0, p.muzzle - dt * 9);
      p.fireCd -= dt;
      if (g.mode === 'play' && (g.pointer.down || g.reduced) && p.fireCd <= 0) fire();
      p.droneA += dt * 2.4;

      /* ---- nano-repair ---- */
      if (g.mode === 'play' && lv('regen') && p.shields < p.maxShields) {
        p.regenT += dt;
        if (p.regenT >= (lv('regen') > 1 ? 14 : 20)) {
          p.regenT = 0;
          p.shields += 1;
          popup(p.x, p.y - 40, 'SHIELD +1', C.neon);
        }
      }

      /* ---- boss aftermath: a chain of blasts, then the upgrade pick ---- */
      if (g.chain) {
        g.chain.t -= dt;
        if (g.chain.t <= 0) {
          g.chain.t = 0.13;
          g.chain.n -= 1;
          explode(g.chain.x + rand(-70, 70) * g.ui, g.chain.y + rand(-40, 40) * g.ui, Math.random() < 0.5 ? C.amber : C.red, rand(0.8, 1.4));
          addShake(0.3);
          if (g.chain.n <= 0) g.chain = null;
        }
      }
      if (g.toUpgrade > 0 && g.mode === 'play') {
        g.toUpgrade -= dt;
        if (g.toUpgrade <= 0) openUpgrade();
      }
      if (g.mode === 'upgrade') g.pickT += dt;
      if (g.warnT > 0) g.warnT -= dt;

      /* ---- spawn queue ---- */
      for (let i = g.spawnQ.length - 1; i >= 0; i--) {
        if (g.t >= g.spawnQ[i].at) { g.spawnQ[i].make(); g.spawnQ.splice(i, 1); }
      }

      /* ---- enemies ---- */
      for (let i = g.enemies.length - 1; i >= 0; i--) {
        const e = g.enemies[i];
        if (!e) continue;
        e.stateT += dt;
        e.flash = Math.max(0, e.flash - dt * 4);
        e.spin += dt * (e.big ? 0.5 : 0.9);

        if (e.state === 'enter') {
          const tX = e.sx, tY = e.sy;
          e.vx = lerp(e.vx, (tX - e.x) * 3.2, 1 - Math.exp(-6 * dt));
          e.vy = lerp(e.vy, (tY - e.y) * 3.2, 1 - Math.exp(-6 * dt));
          e.x += e.vx * dt; e.y += e.vy * dt;
          if (Math.hypot(tX - e.x, tY - e.y) < 12) { e.state = 'hold'; e.stateT = 0; }
        } else if (e.kind === 'boss') {
          stepBoss(e, dt);
        } else if (e.state === 'hold') {
          const sway = Math.sin(g.t * 1.1 + e.phase) * 34;
          const bob = Math.sin(g.t * 1.8 + e.phase * 1.7) * 9;
          const tX = e.sx + sway, tY = e.sy + bob;
          e.vx = lerp(e.vx, (tX - e.x) * 4, 1 - Math.exp(-7 * dt));
          e.vy = lerp(e.vy, (tY - e.y) * 4, 1 - Math.exp(-7 * dt));
          e.x += e.vx * dt; e.y += e.vy * dt;
          if (e.burst > 0) {
            e.burstT -= dt;
            if (e.burstT <= 0) { e.burst -= 1; e.burstT = 0.13; shootFoe(e.x, e.y + 8, aimAt(e), 300 + g.sector * 18, 'dart', 6, C.amber); }
          }
          e.fireCd -= dt;
          if (e.fireCd <= 0) foeFire(e);
          /* only grunts break formation to dive at the player */
          if (e.kind === 'grunt' && Math.random() < dt * 0.12) { e.state = 'dive'; e.stateT = 0; }
        } else if (e.state === 'dive') {
          const dx = g.p.x - e.x, dy = g.p.y - e.y;
          const d = Math.hypot(dx, dy) || 1;
          const acc = 900;
          e.vx += (dx / d) * acc * dt;
          e.vy += (dy / d) * acc * dt;
          const s = Math.hypot(e.vx, e.vy);
          const maxS = 430 + g.sector * 25;
          if (s > maxS) { e.vx = (e.vx / s) * maxS; e.vy = (e.vy / s) * maxS; }
          e.x += e.vx * dt; e.y += e.vy * dt;
          if (Math.random() < dt * 1.5) spark(e.x, e.y + 8, C.red, 1, 40, 0.4, 1.6);
          if (e.stateT > 2.2 || e.y > g.h + 60) { e.state = 'enter'; e.y = -70; e.x = rand(60, g.w - 60); e.vx = 0; e.vy = 0; }
        } else if (e.state === 'dart') {
          /* falls faster and faster, leaning toward the player until it is past */
          e.vy = Math.min(e.vy + 520 * dt, 560 + g.sector * 30);
          if (e.y < g.p.y - 80) e.vx = lerp(e.vx, (g.p.x - e.x) * 1.2, 1 - Math.exp(-2 * dt));
          else e.vx *= Math.exp(-2 * dt);
          e.x += e.vx * dt; e.y += e.vy * dt;
          if (Math.random() < dt * 8) spark(e.x, e.y - 10, C.magenta, 1, 30, 0.3, 1.4);
          if (e.y > g.h + 60) { g.enemies.splice(i, 1); continue; }
        }

        e.roll = clamp(e.vx * 0.0009, -0.4, 0.4);

        /* body collision with player (ramming hurts small foes, not the boss) */
        if (g.mode === 'play' && Math.hypot(e.x - g.p.x, e.y - g.p.y) < e.r + 20 * g.ui) {
          damagePlayer();
          if (e.kind !== 'boss') hurt(e, 2);
        }
      }

      /* wave cleared → next wave (the boss wave ends through the upgrade pick) */
      if (g.mode === 'play' && g.wave <= WAVES_PER_SECTOR && g.enemies.length === 0 && g.spawnQ.length === 0) {
        g.waveClearT += dt;
        if (g.waveClearT > 1.1) { g.waveClearT = 0; startWave(g.wave + 1); }
      } else g.waveClearT = 0;

      /* ---- bullets ---- */
      for (let i = g.bullets.length - 1; i >= 0; i--) {
        const b = g.bullets[i];
        if (!b) continue;
        if (b.homing) {
          const tg = nearestEnemy(b.x, b.y);
          const sp = Math.min(980, Math.hypot(b.vx, b.vy) + 1300 * dt);
          let ang = Math.atan2(b.vy, b.vx);
          if (tg) {
            const dA = Math.atan2(Math.sin(Math.atan2(tg.y - b.y, tg.x - b.x) - ang), Math.cos(Math.atan2(tg.y - b.y, tg.x - b.x) - ang));
            ang += clamp(dA, -7 * dt, 7 * dt);
          }
          b.vx = Math.cos(ang) * sp; b.vy = Math.sin(ang) * sp;
          if (Math.random() < dt * 30) spark(b.x, b.y, b.color, 1, 20, 0.25, 1.3);
        }
        b.x += b.vx * dt; b.y += b.vy * dt;
        b.life -= dt;
        if (b.life <= 0 || b.x < -60 || b.x > g.w + 60 || b.y < -60 || b.y > g.h + 60) {
          g.bullets.splice(i, 1); continue;
        }
        if (b.friendly) {
          for (let j = g.enemies.length - 1; j >= 0; j--) {
            const e = g.enemies[j];
            if (!e || Math.hypot(e.x - b.x, e.y - b.y) > e.r) continue;
            if (b.pierce) {
              if (b.hit.has(e)) continue;
              b.hit.add(e);
            } else g.bullets.splice(i, 1);
            spark(b.x, b.y, b.color, 4, 160, 0.3, 1.8);
            hurt(e, b.dmg);
            if (!b.pierce) break;
          }
        } else if (g.mode === 'play' && Math.hypot(g.p.x - b.x, g.p.y - b.y) < b.r + 12 * g.ui) {
          g.bullets.splice(i, 1);
          damagePlayer();
        }
      }

      /* ---- drops: gems fly into the tractor beam, capsules drift down ---- */
      const reach = 150 + lv('magnet') * 120;
      for (let i = g.drops.length - 1; i >= 0; i--) {
        const d = g.drops[i];
        d.life -= dt;
        const dx = g.p.x - d.x, dy = g.p.y - d.y;
        const dist = Math.hypot(dx, dy) || 1;
        const R = d.kind === 'gem' ? reach + 90 : reach;
        if (g.mode === 'play' && dist < R) {
          const pull = 1500 / dist;
          d.vx += (dx / dist) * pull * dt * 40;
          d.vy += (dy / dist) * pull * dt * 40;
          d.vx *= Math.exp(-1.4 * dt); d.vy *= Math.exp(-1.4 * dt);
        } else if (d.kind === 'cap') {
          d.vy = lerp(d.vy, 55, 1 - Math.exp(-1.5 * dt));
          d.vx = lerp(d.vx, Math.sin(g.t * 1.6 + d.ph) * 70, 1 - Math.exp(-2 * dt));
        } else {
          d.vx *= Math.exp(-1.4 * dt); d.vy *= Math.exp(-1.4 * dt);
        }
        d.x += d.vx * dt; d.y += d.vy * dt;
        if (g.mode === 'play' && dist < 30 * g.ui) {
          if (d.kind === 'cap') applyCap(d);
          else {
            g.score += 150;
            popup(d.x, d.y, '+150', C.violet);
            spark(d.x, d.y, C.violet, 8, 140, 0.4, 1.8);
          }
          g.drops.splice(i, 1);
          continue;
        }
        if (d.life <= 0 || d.y > g.h + 40) g.drops.splice(i, 1);
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

    /* word-wrapped text, for the upgrade cards */
    const wrapText = (str, x, y, maxW, lh, opts) => {
      ctx.font = `${opts.weight || '500'} ${((opts.size || 12) * g.ui).toFixed(2)}px ${MONO}`;
      let line = '';
      for (const word of str.split(' ')) {
        const next = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(next).width > maxW) { text(line, x, y, opts); line = word; y += lh; }
        else line = next;
      }
      if (line) text(line, x, y, opts);
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

      /* gems */
      ctx.globalCompositeOperation = 'lighter';
      for (const d of g.drops) {
        if (d.kind === 'cap') continue;
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

      /* capsules: a lettered pill, blinking as it runs out */
      for (const d of g.drops) {
        if (d.kind !== 'cap') continue;
        const c = CAPS[d.letter];
        const u = g.ui;
        const fade = clamp(d.life, 0, 1) * (d.life < 3 && Math.floor(g.t * 8) % 2 ? 0.4 : 1);
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * (0.22 + Math.sin(g.t * 6 + d.ph) * 0.1);
        ctx.fillStyle = c.color;
        ctx.beginPath(); ctx.arc(0, 0, 26 * u, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fade;
        ctx.fillStyle = 'rgba(5,11,20,0.92)';
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(-18 * u, -12 * u, 36 * u, 24 * u, 12 * u); ctx.fill(); ctx.stroke();
        ctx.restore();
        text(d.letter, d.x, d.y + 5 * u, { size: 14, color: c.color, align: 'center', weight: '800', alpha: fade, glow: 8 });
      }

      /* enemies */
      for (const e of g.enemies) {
        drawSaucer(ctx, {
          x: e.x, y: e.y, scale: e.scale, roll: e.roll, t: g.t + e.phase,
          accent: C.red, foe: true,
          lights: [C.red, C.amber, C.red],
          thrust: e.state === 'dive' || e.state === 'dart' ? 1 : 0.25,
          flash: e.flash, spin: e.big ? e.spin * 0.25 : 0, big: e.big,
          solid: !!three,
        });
        /* small health bar once a tough foe has been hit */
        if (!e.big && e.maxHp > 1 && e.hp < e.maxHp) {
          const w = 46 * g.ui, y = e.y - e.r - 12;
          ctx.fillStyle = 'rgba(255,69,69,0.18)';
          ctx.fillRect(e.x - w / 2, y, w, 3);
          ctx.fillStyle = FOES[e.kind].color;
          ctx.fillRect(e.x - w / 2, y, w * clamp(e.hp / e.maxHp, 0, 1), 3);
        }
      }

      /* bullets (drawn in 3D once the ship layer is up) */
      ctx.globalCompositeOperation = 'lighter';
      for (const b of three ? [] : g.bullets) {
        const ang = Math.atan2(b.vy, b.vx);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(ang);
        if (b.style === 'laser') {
          const grd = ctx.createLinearGradient(-64, 0, 10, 0);
          grd.addColorStop(0, 'rgba(0,0,0,0)');
          grd.addColorStop(1, b.color);
          ctx.fillStyle = grd;
          ctx.fillRect(-64, -2.6, 74, 5.2);
          ctx.fillStyle = b.core;
          ctx.fillRect(-34, -1, 44, 2);
        } else if (b.style === 'missile') {
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = b.color;
          ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill();
          ctx.globalAlpha = 1;
          ctx.fillStyle = b.core;
          ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -4.5); ctx.lineTo(-2, 0); ctx.lineTo(-5, 4.5); ctx.closePath(); ctx.fill();
        } else if (b.style === 'orb') {
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = b.color;
          ctx.beginPath(); ctx.arc(0, 0, b.r * 2, 0, TAU); ctx.fill();
          ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.arc(0, 0, b.r, 0, TAU); ctx.fill();
          ctx.fillStyle = '#fff4fb';
          ctx.beginPath(); ctx.arc(0, 0, b.r * 0.45, 0, TAU); ctx.fill();
        } else {
          const col = b.color || (b.friendly ? C.neon : C.red);
          const len = b.friendly ? 22 : 14;
          const grd = ctx.createLinearGradient(-len, 0, len * 0.4, 0);
          grd.addColorStop(0, 'rgba(0,0,0,0)');
          grd.addColorStop(1, col);
          ctx.fillStyle = grd;
          ctx.fillRect(-len, -1.6, len * 1.4, 3.2);
          ctx.fillStyle = b.friendly ? b.core : '#ffd9d9';
          ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, TAU); ctx.fill();
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill();
        }
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

        /* escort drones (3D mini saucers once the ship layer is up) */
        if (inGame && !three) {
          ctx.globalCompositeOperation = 'lighter';
          for (let i = 0; i < lv('drone'); i++) {
            const d = dronePos(i);
            ctx.globalAlpha = 0.3 * blink;
            ctx.fillStyle = C.violet;
            ctx.beginPath(); ctx.arc(d.x, d.y, 12 * g.ui, 0, TAU); ctx.fill();
            ctx.globalAlpha = blink;
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(g.t * 3);
            ctx.fillStyle = '#efe6ff';
            ctx.fillRect(-4.5 * g.ui, -4.5 * g.ui, 9 * g.ui, 9 * g.ui);
            ctx.restore();
          }
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
        }
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
        const T = TXT[langKey()];
        ctx.globalAlpha = k;
        const pad = 22;
        text('SCORE', pad, 52, { size: 9, color: C.dim, weight: '600' });
        text(String(g.score).padStart(6, '0'), pad, 72, { size: 20, color: C.neon, weight: '700', glow: 12 });
        text(`HI ${String(g.hi).padStart(6, '0')}`, pad, 88, { size: 9, color: C.dim, weight: '600' });

        /* sector / wave, and the boss bar once it is on screen */
        text(`SECTOR ${pad2(g.sector)}`, g.w / 2, 50, { size: 12, color: C.blue, align: 'center', weight: '700', glow: 8 });
        text(g.wave > WAVES_PER_SECTOR ? 'BOSS' : `WAVE ${Math.max(1, g.wave)}/${WAVES_PER_SECTOR}`, g.w / 2, 66, {
          size: 9, color: g.wave > WAVES_PER_SECTOR ? C.red : C.dim, align: 'center', weight: '600',
        });
        if (g.boss) {
          const bw = Math.min(g.w * 0.5, 420), bx = g.w / 2 - bw / 2, by = 80;
          ctx.fillStyle = 'rgba(255,69,69,0.15)';
          ctx.fillRect(bx, by, bw, 5);
          ctx.fillStyle = g.boss.rage ? C.amber : C.red;
          ctx.fillRect(bx, by, bw * clamp(g.boss.hp / g.boss.maxHp, 0, 1), 5);
          text(g.boss.name, g.w / 2, by + 20, { size: 9, color: g.boss.rage ? C.amber : C.red, align: 'center', weight: '700' });
        }

        text('SHIELDS', g.w - pad, 52, { size: 9, color: C.dim, align: 'right', weight: '600' });
        for (let i = 0; i < p.maxShields; i++) {
          const on = i < p.shields;
          ctx.fillStyle = on ? C.neon : 'rgba(71,85,105,0.35)';
          ctx.globalAlpha = k * (on ? 1 : 0.6);
          ctx.fillRect(g.w - pad - 12 - i * 16, 62, 12, 10);
        }
        ctx.globalAlpha = k;
        text('BOMBS', g.w - pad, 92, { size: 9, color: C.dim, align: 'right', weight: '600' });
        for (let i = 0; i < p.maxBombs; i++) {
          const on = i < p.bombs;
          ctx.fillStyle = on ? C.red : 'rgba(71,85,105,0.35)';
          ctx.globalAlpha = k * (on ? 1 : 0.6);
          ctx.beginPath(); ctx.arc(g.w - pad - 6 - i * 16, 104, 5, 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = k;

        /* gun + level pips under the score; upgrades taken under the bombs */
        const wpn = WEAPONS[p.weapon];
        const wy = 118;
        text(wpn.name, pad, wy, { size: 13, color: wpn.color, weight: '800', glow: 10 });
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = i < p.wlvl ? wpn.color : 'rgba(71,85,105,0.4)';
          ctx.fillRect(pad + i * 15, wy + 8, 11, 4);
        }
        let ux = g.w - pad;
        for (const u of UPGRADES) {
          const n = lv(u.id);
          if (!n) continue;
          text(`${u.icon}${n > 1 ? n : ''}`, ux, 134, { size: 13, color: C.neon, align: 'right', weight: '700', glow: 6 });
          ux -= 34 * g.ui;
        }

        if (g.combo > 1) {
          const punch = 1 + clamp(g.comboT - 1.7, 0, 0.3) * 2;
          text(`x${g.combo}`, g.p.x, g.p.y - 44, {
            size: 15 * punch, color: C.amber, align: 'center', weight: '700', glow: 10,
            alpha: clamp(g.comboT, 0, 1),
          });
        }

        if (g.hintT > 0) {
          const a = clamp(g.hintT, 0, 1) * k;
          text(g.narrow ? T.narrow : T.wide, g.w / 2, g.h - 80, {
            size: 10, color: C.dim, align: 'center', alpha: a, weight: '600',
          });
        }

        /* boss warning: red bands pulsing top and bottom */
        if (g.warnT > 0) {
          const a = (0.5 + Math.sin(g.t * 12) * 0.5) * clamp(g.warnT, 0, 1);
          ctx.fillStyle = `rgba(255,69,69,${0.2 * a})`;
          ctx.fillRect(0, 0, g.w, g.h * 0.09);
          ctx.fillRect(0, g.h * 0.91, g.w, g.h * 0.09);
        }

        if (g.bannerT > 0) {
          const blinkB = g.warnT > 0 ? 0.55 + Math.sin(g.t * 12) * 0.45 : 1;
          const a = clamp(g.bannerT / 0.5, 0, 1) * blinkB;
          const grow = 1 + (1 - clamp(g.bannerT / 1.6, 0, 1)) * 0.08;
          text(g.banner, g.w / 2, g.h * 0.42, {
            size: 40 * grow, color: g.bannerC, align: 'center', weight: '700', alpha: a, glow: 18,
          });
        }

        /* upgrade pick: three cards, side by side or stacked on phones */
        if (g.mode === 'upgrade') {
          const a = clamp(g.pickT / 0.4, 0, 1);
          ctx.fillStyle = `rgba(3,7,14,${0.8 * a})`;
          ctx.fillRect(0, 0, g.w, g.h);
          const narrow = g.w < 720;
          const px = (n) => n / g.ui;      // the HUD shrinks text with g.ui; cards need readable sizes
          const n = g.cards.length;
          const gap = 18;
          const cw = narrow ? Math.min(g.w - 48, 360) : 230;
          const ch = narrow ? 104 : 220;
          const totalW = narrow ? cw : n * cw + (n - 1) * gap;
          const totalH = narrow ? n * ch + (n - 1) * gap : ch;
          const x0 = g.w / 2 - totalW / 2;
          const y0 = g.h / 2 - totalH / 2 + 24;
          text(T.clear, g.w / 2, y0 - 58, { size: px(11), color: C.amber, align: 'center', weight: '700', alpha: a, glow: 8 });
          text(T.pick, g.w / 2, y0 - 26, { size: px(narrow ? 20 : 26), color: C.white, align: 'center', weight: '800', alpha: a, glow: 12 });
          const hover = cardAt(g.pointer.rx, g.pointer.ry);
          g.cards.forEach((c, i) => {
            const rise = (1 - clamp((g.pickT - i * 0.08) / 0.35, 0, 1)) * 30;
            const x = narrow ? x0 : x0 + i * (cw + gap);
            const y = (narrow ? y0 + i * (ch + gap) : y0) + rise;
            c.rect = { x, y, w: cw, h: ch };
            const hov = i === hover;
            const [name, desc] = c.u[langKey()];
            const lvNow = lv(c.u.id);
            ctx.globalAlpha = a;
            ctx.fillStyle = hov ? 'rgba(0,229,160,0.12)' : 'rgba(10,20,34,0.94)';
            ctx.strokeStyle = hov ? C.neon : 'rgba(0,229,160,0.3)';
            ctx.lineWidth = hov ? 2 : 1;
            ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 14); ctx.fill(); ctx.stroke();
            const lvTxt = c.u.max > 1 ? `${T.lvl} ${lvNow + 1}/${c.u.max}` : '';
            text(String(i + 1), x + 14, y + 22, { size: px(10), color: C.dim, weight: '700', alpha: a });
            if (narrow) {
              text(c.u.icon, x + 38, y + ch / 2 + 11, { size: px(30), color: C.neon, align: 'center', weight: '700', alpha: a, glow: 10 });
              text(name.toUpperCase(), x + 72, y + 34, { size: px(13), color: C.white, weight: '800', alpha: a });
              wrapText(desc, x + 72, y + 56, cw - 88, 15, { size: px(11), color: '#9fb1c6', alpha: a });
              if (lvTxt) text(lvTxt, x + cw - 14, y + 22, { size: px(9), color: C.neon, align: 'right', weight: '700', alpha: a });
            } else {
              text(c.u.icon, x + cw / 2, y + 76, { size: px(44), color: C.neon, align: 'center', weight: '700', alpha: a, glow: hov ? 18 : 10 });
              text(name.toUpperCase(), x + cw / 2, y + 120, { size: px(13), color: C.white, align: 'center', weight: '800', alpha: a });
              wrapText(desc, x + cw / 2, y + 146, cw - 32, 17, { size: px(11), color: '#9fb1c6', align: 'center', alpha: a });
              if (lvTxt) text(lvTxt, x + cw / 2, y + ch - 18, { size: px(9), color: C.neon, align: 'center', weight: '700', alpha: a });
            }
          });
          ctx.globalAlpha = k;
          text(narrow ? T.tap : T.keys, g.w / 2, y0 + totalH + 40, { size: px(10), color: C.dim, align: 'center', weight: '600', alpha: a });
        }

        if (g.mode === 'over') {
          const a = clamp(g.overT / 0.6, 0, 1);
          ctx.fillStyle = `rgba(3,7,14,${0.72 * a})`;
          ctx.fillRect(0, 0, g.w, g.h);
          text('SIGNAL LOST', g.w / 2, g.h * 0.42, { size: 42, color: C.red, align: 'center', weight: '700', alpha: a, glow: 20 });
          text(`SCORE ${String(g.score).padStart(6, '0')}`, g.w / 2, g.h * 0.42 + 40, { size: 15, color: C.neon, align: 'center', weight: '700', alpha: a });
          text(`SECTOR ${pad2(g.sector)}   ·   HI ${String(g.hi).padStart(6, '0')}`, g.w / 2, g.h * 0.42 + 62, { size: 11, color: C.dim, align: 'center', alpha: a });
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
      if (backdropRef.current && g.tintSector !== g.sector) {
        g.tintSector = g.sector;
        const c = TINTS[(g.sector - 1) % TINTS.length];
        backdropRef.current.style.background = `radial-gradient(ellipse at center, rgba(${c},0) 25%, rgba(${c},0.86) 95%)`;
      }
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
      clearTimeout(bootTimer);
      if (three) three.dispose();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('contextmenu', onContext);
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
      >
        {arcade && <div className="ufo-stars" />}
      </div>
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
