'use client';
import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  SiJavascript, SiReact, SiNextdotjs, SiTailwindcss, SiHtml5,
  SiRubyonrails, SiNodedotjs, SiPython, SiPostgresql,
  SiGit, SiDocker, SiWordpress, SiOpenai, SiThreedotjs, SiBlender,
} from 'react-icons/si';
import { TbApi, TbDatabase, TbBrowser } from 'react-icons/tb';
import { LetterHeading } from '@/components/Letters';

/* Bottom to top: the packet starts in the database and ends on screen. */
const LAYERS = [
  {
    key: 'layerData', tone: '#6ba6fb', code: 'SELECT * FROM treinos;',
    items: [
      { name: 'PostgreSQL',  Icon: SiPostgresql, color: '#6b9bd8' },
      { name: 'Oracle APEX', Icon: TbDatabase,   color: '#F80000' },
    ],
  },
  {
    key: 'layerServer', tone: '#a5b4fc', code: 'render json: @treinos',
    items: [
      { name: 'Ruby on Rails', Icon: SiRubyonrails, color: '#CC0000' },
      { name: 'Node.js',       Icon: SiNodedotjs,   color: '#68A063' },
      { name: 'Python',        Icon: SiPython,      color: '#4B8BBE' },
      { name: 'REST API',      Icon: TbApi,         color: '#9fb0c6' },
    ],
  },
  {
    key: 'layerInterface', tone: '#00e5a0', code: '<Treino {...dados} />',
    items: [
      { name: 'JavaScript',   Icon: SiJavascript,  color: '#F7DF1E' },
      { name: 'React',        Icon: SiReact,       color: '#61DAFB' },
      { name: 'Next.js',      Icon: SiNextdotjs,   color: '#ffffff' },
      { name: 'Tailwind CSS', Icon: SiTailwindcss, color: '#38bdf8' },
      { name: 'HTML & CSS',   Icon: SiHtml5,       color: '#E44D26' },
    ],
  },
  {
    key: 'layerBrowser', tone: '#ff2bd6', code: null,
    items: [
      { name: 'Three.js', Icon: SiThreedotjs, color: '#ffffff' },
      { name: 'WebGL',    Icon: TbBrowser,    color: '#ff2bd6' },
    ],
  },
];

const TOOLS = [
  { name: 'Git',        Icon: SiGit,       color: '#F05032' },
  { name: 'Docker',     Icon: SiDocker,    color: '#2496ED' },
  { name: 'Blender',    Icon: SiBlender,   color: '#F5792A' },
  { name: 'WordPress',  Icon: SiWordpress, color: '#21759B' },
  { name: 'OpenAI API', Icon: SiOpenai,    color: '#ffffff' },
];

const GAP = 108;        // vertical distance between plates, px
const PLATE = 230;      // plate edge, px

function TechList({ items, lit }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {items.map(({ name, Icon, color }) => (
        <li key={name} className="inline-flex items-center gap-2 text-sm transition-colors duration-300" style={{ color: lit ? '#e6edf6' : '#6b7d96' }}>
          <Icon aria-hidden="true" className="w-4 h-4 transition-opacity duration-300" style={{ color, opacity: lit ? 1 : 0.35 }} />
          {name}
        </li>
      ))}
    </ul>
  );
}

function Tools() {
  const { t } = useTranslation();
  return (
    <div className="mt-10">
      <p className="mono-label">{t('layerTooling')}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {TOOLS.map(({ name, Icon, color }) => (
          <li key={name} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted">
            <Icon aria-hidden="true" className="w-3.5 h-3.5" style={{ color }} /> {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Desktop: the section pins for ~3 screens while scroll drives a packet up an
   isometric stack of plates. Each plate lights as the packet passes it. */
function Pinned() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const [stage, setStage] = useState(0);
  useMotionValueEvent(p, 'change', (v) => setStage(Math.min(3.999, Math.max(0, v * 4.6 - 0.3))));

  const packetY = useTransform(p, [0.07, 0.86], [0, -GAP * 3]);
  const packetGlow = useTransform(p, [0, 0.86, 0.95], [0.6, 1, 2.2]);
  const screenFlash = useTransform(p, [0.8, 0.9], [0, 1]);
  const lvl = Math.floor(stage);
  const done = stage > 3.6;

  return (
    <div ref={ref} className="relative hidden lg:block" style={{ height: '320vh' }}>
      <div className="sticky top-0 h-screen flex items-center">
        <div className="wrap grid grid-cols-12 gap-10 items-center">
          <div className="col-span-5">
            <p className="kicker">{t('stackKicker')}</p>
            <LetterHeading text={t('stackTitle')} className="display h-section mt-6 text-text" />
            <p className="mt-6 text-muted max-w-[38ch]">{t('stackSub')}</p>

            <ol className="mt-10 space-y-5">
              {[...LAYERS].reverse().map((L) => {
                const i = LAYERS.indexOf(L);
                const lit = lvl >= i;
                return (
                  <li key={L.key} className="grid grid-cols-[110px_1fr] gap-4 items-start">
                    <span className="font-mono text-xs uppercase tracking-wider pt-0.5 transition-colors duration-300" style={{ color: lit ? L.tone : '#3b4a5f' }}>
                      {lit ? '●' : '○'} {t(L.key)}
                    </span>
                    <TechList items={L.items} lit={lit} />
                  </li>
                );
              })}
            </ol>
            <Tools />
          </div>

          {/* isometric stack */}
          <div className="col-span-7 relative h-[640px]" style={{ perspective: 1600 }}>
            <div className="absolute left-1/2 bottom-[90px]" style={{ transformStyle: 'preserve-3d' }}>
              {LAYERS.map((L, i) => {
                const lit = lvl >= i;
                return (
                  <div key={L.key} className="absolute" style={{ left: -PLATE / 2, bottom: i * GAP, width: PLATE, height: PLATE }}>
                    <div
                      className="absolute inset-0 rounded-[26px] border transition-all duration-500"
                      style={{
                        transform: 'rotateX(60deg) rotateZ(-45deg)',
                        borderColor: lit ? L.tone : '#16263d',
                        background: lit
                          ? `radial-gradient(circle at 50% 50%, ${L.tone}33, #0a1727 70%)`
                          : 'rgba(10,23,39,0.6)',
                        boxShadow: lit ? `0 0 60px -10px ${L.tone}, inset 0 0 40px -20px ${L.tone}` : 'none',
                      }}
                    >
                      {/* grid etched on the plate */}
                      <div className="absolute inset-3 rounded-[18px] opacity-40" style={{ backgroundImage: `linear-gradient(${lit ? L.tone : '#16263d'} 1px, transparent 1px), linear-gradient(90deg, ${lit ? L.tone : '#16263d'} 1px, transparent 1px)`, backgroundSize: '23px 23px', opacity: lit ? 0.25 : 0.4 }} />
                    </div>
                    {/* label floating off the right corner */}
                    <div className="absolute left-[78%] top-[46%] whitespace-nowrap">
                      <p className="display text-sm transition-colors duration-300" style={{ color: lit ? L.tone : '#3b4a5f' }}>{t(L.key)}</p>
                      <motion.p
                        className="font-mono text-[11px] text-muted mt-1"
                        initial={false}
                        animate={{ opacity: lvl === i ? 1 : 0, x: lvl === i ? 0 : -6 }}
                      >
                        {L.code || t('stageBrowser')}
                      </motion.p>
                    </div>
                  </div>
                );
              })}

              {/* beam rail */}
              <div className="absolute left-[-1px] w-[2px]" style={{ bottom: PLATE / 2, height: GAP * 3, background: 'linear-gradient(to top, #6ba6fb, #00e5a0 66%, #ff2bd6)', opacity: 0.35 }} />

              {/* packet */}
              <motion.div className="absolute" style={{ left: -11, bottom: PLATE / 2 - 11, y: packetY }}>
                <motion.div
                  className="w-[22px] h-[22px] rounded-[6px] bg-neon"
                  style={{ rotate: 45, scale: packetGlow, boxShadow: '0 0 24px 6px rgba(0,229,160,0.7), 0 0 80px 10px rgba(0,229,160,0.35)' }}
                  animate={{ rotate: [45, 225] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>

            {/* flash when the packet lands on screen */}
            <motion.div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ opacity: screenFlash, background: 'radial-gradient(circle at 50% 22%, rgba(255,43,214,0.18), transparent 50%)' }} />
            {done && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute left-1/2 top-6 -translate-x-1/2 display text-2xl holo-text"
              >
                {t('stageBrowser')}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Phones and tablets: no pinning, the same story as a stacked list. */
function Stacked() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  return (
    <div className="lg:hidden section">
      <div className="wrap">
        <p className="kicker">{t('stackKicker')}</p>
        <LetterHeading text={t('stackTitle')} className="display h-section mt-6 text-text" />
        <p className="mt-5 text-muted">{t('stackSub')}</p>
        <ol className="mt-10 flex flex-col-reverse gap-4">
          {LAYERS.map((L, i) => (
            <motion.li
              key={L.key}
              initial={reduce ? false : { opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="panel p-5"
              style={{ borderColor: `${L.tone}55` }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="display text-base" style={{ color: L.tone }}>{t(L.key)}</p>
                <p className="font-mono text-[10px] text-dim truncate">{L.code || t('stageBrowser')}</p>
              </div>
              <div className="mt-4"><TechList items={L.items} lit /></div>
            </motion.li>
          ))}
        </ol>
        <Tools />
      </div>
    </div>
  );
}

export default function Stack() {
  return (
    <section id="skills" className="relative rule">
      <Pinned />
      <Stacked />
    </section>
  );
}
