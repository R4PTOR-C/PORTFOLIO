'use client';
import { useState, useEffect } from 'react';

export default function Typewriter({ text, delay = 0, speed = 80, className = '', style = {}, onDone }) {
  const [displayed, setDisplayed] = useState('');
  const [started,   setStarted]   = useState(false);
  const [done,      setDone]      = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      setDone(true);
      onDone?.();
      return;
    }
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [started, displayed, text, speed, onDone]);

  return (
    <span className={className} style={style}>
      {displayed}
      {!done && (
        <span
          className="inline-block w-[2px] h-[1em] ml-[1px] align-middle animate-pulse"
          style={{ background: 'currentColor', opacity: 0.7 }}
        />
      )}
    </span>
  );
}
