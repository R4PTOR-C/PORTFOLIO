'use client';
import { useEffect, useRef } from 'react';

const STAR_COUNT = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 60 : 120;

export default function StarField() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const stars = useRef([]);
  const raf   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init stars
    stars.current = Array.from({ length: STAR_COUNT }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    Math.random() * 1.4 + 0.3,
      ox:   0, oy: 0,   // offset from mouse parallax
      vx:   (Math.random() - 0.5) * 0.08,
      vy:   (Math.random() - 0.5) * 0.08,
      alpha: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.008 + 0.003,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
    }));

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width  / 2;
      const cy = canvas.height / 2;
      const mx = (mouse.current.x - cx) / cx; // -1 to 1
      const my = (mouse.current.y - cy) / cy;

      stars.current.forEach(s => {
        // Drift
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width)  s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;

        // Parallax offset
        const targetOx = mx * s.r * 18;
        const targetOy = my * s.r * 18;
        s.ox += (targetOx - s.ox) * 0.04;
        s.oy += (targetOy - s.oy) * 0.04;

        // Twinkle
        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha > 0.75 || s.alpha < 0.15) s.twinkleDir *= -1;

        ctx.beginPath();
        ctx.arc(s.x + s.ox, s.y + s.oy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.alpha})`;
        ctx.fill();
      });

      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6, willChange: 'transform', transform: 'translateZ(0)' }}
    />
  );
}
