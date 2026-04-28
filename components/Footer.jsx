'use client';
import { useTranslation } from 'react-i18next';
import { socialLinks } from '@/lib/socialLinks';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-dim py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

        <p className="text-dim text-sm font-mono">
          © {year} <span className="text-muted">Rafael Caldas</span>
          <span className="text-border mx-2">—</span>
          {t('footerRights')}
        </p>

        <div className="flex items-center gap-2">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label={s.label}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-dim hover:text-neon hover:border-neon/30 hover:bg-neon/5 transition-all duration-200"
            >
              {s.icon}
            </a>
          ))}
        </div>

      </div>
    </footer>
  );
}
