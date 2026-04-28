'use client';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import FadeIn from '@/components/FadeIn';
import {
  SiJavascript,
  SiRubyonrails,
  SiReact,
  SiNodedotjs,
  SiPostgresql,
  SiHtml5,
  SiGit,
  SiWordpress,
  SiNextdotjs,
  SiTailwindcss,
  SiPython,
  SiDocker,
} from 'react-icons/si';
import { TbApi, TbBrain, TbLayersIntersect, TbDatabase } from 'react-icons/tb';

const groups = [
  {
    labelKey: 'skillsFront',
    color: '#00e5a0',
    skills: [
      { name: 'JavaScript',  icon: SiJavascript,  color: '#F7DF1E' },
      { name: 'React',       icon: SiReact,       color: '#61DAFB' },
      { name: 'Next.js',     icon: SiNextdotjs,   color: '#ffffff' },
      { name: 'Tailwind CSS',icon: SiTailwindcss, color: '#38bdf8' },
      { name: 'HTML & CSS',  icon: SiHtml5,       color: '#E44D26' },
    ],
  },
  {
    labelKey: 'skillsBack',
    color: '#60a5fa',
    skills: [
      { name: 'Ruby on Rails', icon: SiRubyonrails, color: '#CC0000' },
      { name: 'Node.js',       icon: SiNodedotjs,   color: '#68A063' },
      { name: 'PostgreSQL',    icon: SiPostgresql,  color: '#4479A1' },
      { name: 'REST API',      icon: TbApi,         color: '#00e5a0' },
      { name: 'Python',        icon: SiPython,      color: '#3b82f6' },
      { name: 'Docker',        icon: SiDocker,      color: '#2496ED' },
    ],
  },
  {
    labelKey: 'skillsTools',
    color: '#a78bfa',
    skills: [
      { name: 'Git',               icon: SiGit,            color: '#F05032' },
      { name: 'WordPress',         icon: SiWordpress,      color: '#21759B' },
      { name: 'Oracle APEX',       icon: TbDatabase,       color: '#F80000' },
      { name: 'AI Implementation', icon: TbBrain,          color: '#a78bfa' },
      { name: 'Full-Stack Dev',    icon: TbLayersIntersect,color: '#00e5a0' },
    ],
  },
];

const containerVars = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const tagVars = {
  hidden: { opacity: 0, scale: 0.88, y: 10 },
  show:   { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function Skills() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="skills" className="py-20 md:py-28 px-6 border-t border-border-dim">
      <div className="max-w-6xl mx-auto">

        <FadeIn>
          <div className="section-tag">{t('skillsTag')}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-text">{t('skillsTitle')}</h2>
        </FadeIn>

        <motion.div
          ref={ref}
          variants={containerVars}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="mt-12 flex flex-col gap-8"
        >
          {groups.map(({ labelKey, color, skills }) => (
            <div key={labelKey}>
              <p className="text-[10px] font-mono tracking-[0.25em] uppercase mb-3" style={{ color }}>
                {t(labelKey)}
              </p>
              <div className="flex flex-wrap gap-3">
                {skills.map(({ name, icon: Icon, color: iconColor }) => (
                  <motion.span key={name} variants={tagVars} className="skill-tag">
                    <Icon style={{ color: iconColor, filter: `drop-shadow(0 0 4px ${iconColor}60)` }} className="w-4 h-4 shrink-0" />
                    {name}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
