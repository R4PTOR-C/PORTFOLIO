'use client';
import { useRef } from 'react';
import {
  motion, useScroll, useVelocity, useSpring, useTransform, useMotionValue,
  useAnimationFrame, useReducedMotion,
} from 'framer-motion';

const ITEMS = ['Ruby on Rails', 'PostgreSQL', 'React', 'Next.js', 'Node.js', 'Three.js', 'Blender', 'Oracle APEX', 'Docker', 'OpenAI API'];

/* Two crossed tapes, like caution tape at a launch site. They drift on
   their own and speed up (or reverse) with scroll velocity. */
function Tape({ dir, className, itemClass, rotate }) {
  const reduce = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(vel, [-2000, 0, 2000], [-4, 0, 4], { clamp: false });
  const sign = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const b = boost.get();
    if (b < 0) sign.current = -1; else if (b > 0) sign.current = 1;
    let next = base.get() + dir * sign.current * (1 + Math.abs(b)) * delta * 0.004;
    next = ((next % 50) + 50) % 50;     // the content is doubled: wrap at half
    base.set(next);
  });
  const x = useTransform(base, (v) => `-${v}%`);

  const row = ITEMS.map((it) => (
    <span key={it} className={`flex items-center gap-6 ${itemClass}`}>
      {it}<span aria-hidden="true" className="text-[0.7em]">✦</span>
    </span>
  ));

  return (
    <div className={`absolute left-[-10%] w-[120%] overflow-hidden py-4 ${className}`} style={{ rotate }}>
      <motion.div className="flex w-max gap-6 whitespace-nowrap" style={{ x }}>
        {row}{row}
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div aria-hidden="true" className="relative h-44 md:h-56 overflow-hidden my-4">
      <Tape
        dir={-1}
        rotate="4deg"
        className="top-14 md:top-20 bg-transparent border-y border-neon/30"
        itemClass="display text-2xl md:text-4xl text-transparent [-webkit-text-stroke:1px_rgba(0,229,160,0.6)]"
      />
      <Tape
        dir={1}
        rotate="-3deg"
        className="top-12 md:top-16 bg-neon shadow-[0_0_60px_-10px_rgba(0,229,160,0.6)]"
        itemClass="display text-2xl md:text-4xl text-bg"
      />
    </div>
  );
}
