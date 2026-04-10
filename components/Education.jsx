'use client';
import { useTranslation } from 'react-i18next';
import FadeIn from '@/components/FadeIn';

export default function Education() {
  const { t } = useTranslation();

  return (
    <section id="education" className="py-20 md:py-28 px-6 border-t border-border-dim">
      <div className="max-w-6xl mx-auto">

        <FadeIn>
          <div className="section-tag">{t('educationTitle')}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-text">{t('educationTitle')}</h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-12 card rounded-2xl p-7 md:p-10 max-w-2xl">
            <div className="flex items-start gap-5">

              {/* Icon */}
              <div className="w-12 h-12 shrink-0 rounded-xl border border-neon/20 bg-neon/5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-neon">
                  <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-text font-bold text-lg">{t('eduSchool')}</h3>
                    <p className="text-muted text-sm mt-1">{t('eduDegree')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs font-mono px-3 py-1.5 rounded-full border border-border text-dim">
                      {t('eduPeriod')}
                    </span>
                    <span className="text-xs font-mono px-3 py-1.5 rounded-full border border-neon/30 text-neon bg-neon/5">
                      {t('eduStatus')}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
