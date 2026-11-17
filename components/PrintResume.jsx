'use client';
import { useTranslation } from 'react-i18next';
import { LAYERS, TOOLS } from '@/components/Stack';

const EMAIL = 'rafaelcroriz7@gmail.com';
const LINKS = [
  ['github.com/R4PTOR-C', 'https://github.com/R4PTOR-C'],
  ['linkedin.com/in/rafael-caldas-76174b207', 'https://www.linkedin.com/in/rafael-caldas-76174b207'],
];

/* A one-page résumé that exists only on paper. On screen it is display:none;
   in print every other part of the page is hidden and this is all that is
   left (see the PRINT block in globals.css). Same facts as the site, from
   the same translation strings, in the language the viewer has picked. */
export default function PrintResume() {
  const { t } = useTranslation();
  const skills = [...LAYERS.flatMap((l) => l.items), ...TOOLS].map((i) => i.name);

  const jobs = [
    { title: t('fenrysRole'), place: t('fenrysPlace'), lines: [t('printFenrys')] },
    { title: `${t('exp2Role')} · ${t('exp2Company')}`, place: t('exp2CompanyFull'), period: t('exp2Period'), lines: ['exp2Desc1', 'exp2Desc2', 'exp2Desc3'].map((k) => t(k)) },
    { title: `${t('exp1Role')} · ${t('exp1Company')}`, place: t('exp1CompanyFull'), period: t('exp1Period'), lines: ['exp1Desc1', 'exp1Desc2', 'exp1Desc3'].map((k) => t(k)) },
  ];

  return (
    <article className="print-resume" aria-hidden="true">
      <header className="pr-head">
        <div>
          <h1>Rafael Caldas</h1>
          <p className="pr-role">{t('heroRole')} · {t('contactLocation')}</p>
        </div>
        <ul className="pr-contact">
          <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
          {LINKS.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}
        </ul>
      </header>

      <p className="pr-summary">{t('printSummary')}</p>

      <section>
        <h2>{t('printExperience')}</h2>
        {jobs.map((j) => (
          <div key={j.title} className="pr-item">
            <div className="pr-line">
              <h3>{j.title}</h3>
              {j.period && <span className="pr-period">{j.period}</span>}
            </div>
            <p className="pr-place">{j.place}</p>
            <ul>{j.lines.map((l) => <li key={l}>{l}</li>)}</ul>
          </div>
        ))}
      </section>

      <section>
        <h2>{t('printProject')}</h2>
        <div className="pr-item">
          <div className="pr-line">
            <h3>Atlanteon</h3>
            <span className="pr-period">atlanteontraining.com.br</span>
          </div>
          <p>{t('projAtlDesc')}</p>
          <ul>{['projAtlFact1', 'projAtlFact2', 'projAtlFact3'].map((k) => <li key={k}>{t(k)}</li>)}</ul>
        </div>
      </section>

      <section>
        <h2>{t('printEducation')}</h2>
        <div className="pr-item">
          <div className="pr-line">
            <h3>{t('eduRole')}</h3>
            <span className="pr-period">{t('eduStatusLine')}</span>
          </div>
          <p className="pr-place">{t('eduCompany')}</p>
        </div>
      </section>

      <section>
        <h2>{t('printSkills')}</h2>
        <p>{skills.join(' · ')}</p>
      </section>
    </article>
  );
}
