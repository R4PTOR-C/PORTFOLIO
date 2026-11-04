'use client';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="rule py-10">
      <div className="wrap flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="font-mono text-xs text-dim max-w-[60ch]">{t('footerMade')}</p>
        <p className="mono-label">
          © {year} <span className="text-muted">Rafael Caldas</span> · {t('footerRights')}
        </p>
      </div>
    </footer>
  );
}
