'use client';
import { useEffect, useRef } from 'react';

export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = window.matchMedia('(pointer: coarse)').matches ? 60 : 120;

    let raf = null;
    const mouse = { x: 0, y: 0 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      ox: 0, oy: 0,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      alpha: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.008 + 0.003,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
    }));

    const paint = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x + s.ox, s.y + s.oy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.alpha})`;
        ctx.fill();
      });
    };

    /* Reduced motion: paint the sky once and leave it still. */
    if (reduced) {
      paint();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };

    const draw = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const mx = (mouse.x - cx) / cx;
      const my = (mouse.y - cy) / cy;

      stars.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;

        s.ox += (mx * s.r * 18 - s.ox) * 0.04;
        s.oy += (my * s.r * 18 - s.oy) * 0.04;

        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha > 0.75 || s.alpha < 0.15) s.twinkleDir *= -1;
      });

      paint();
      raf = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
