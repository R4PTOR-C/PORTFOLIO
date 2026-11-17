'use client';
import { useEffect, useState } from 'react';

/* Local time in Goiânia (Brasília time, no DST), whatever the viewer's own
   zone. The page is a static export, so the server has no clock to agree
   with: this returns null until it mounts, then ticks every 20 s. */
const FMT = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function goianiaNow() {
  const parts = Object.fromEntries(FMT.formatToParts(new Date()).map((p) => [p.type, p.value]));
  const hour = Number(parts.hour) % 24;
  const minute = Number(parts.minute);
  return { hour, minute, label: `${String(hour).padStart(2, '0')}:${parts.minute}`, period: periodOf(hour + minute / 60) };
}

/* the sky's four moods, by the clock in Goiânia */
export function periodOf(h) {
  if (h >= 5 && h < 7) return 'dawn';
  if (h >= 7 && h < 17) return 'day';
  if (h >= 17 && h < 19) return 'dusk';
  return 'night';
}

/* what Rafael is probably doing, for the contact line */
export function statusOf(hour) {
  if (hour >= 23 || hour < 7) return 'asleep';
  if (hour >= 8 && hour < 18) return 'work';
  return 'off';
}

export default function useGoianiaTime() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(goianiaNow());
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);
  return now;
}
