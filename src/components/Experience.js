import React from "react";
import { useTranslation } from 'react-i18next';

const Experience = () => {
    const { t } = useTranslation();

    return (
        <div id="experience-section" className="container">
            <div className="main-timeline">
                {/* Experiência de desenvolvimento back-end */}
                <article className="timeline">
                    <div className="date-content">
                        <div className="date-outer">
                            <time className="date">
                                <span className="month">{t('experience1Duration')}</span>
                                <span className="year">{t('experience1Year')}</span>
                            </time>
                        </div>
                    </div>
                    <div className="timeline-content">
                        <h5 className="title">{t('experience1Title')}</h5>
                        <p className="description">
                            {t('experience1Description')}
                        </p>
                    </div>
                </article>

                <article className="timeline">
                    <div className="date-content">
                        <div className="date-outer">
                            <time className="date">
                                <span className="month">{t('experience2Duration')}</span>
                                <span className="year">{t('experience2Year')}</span>
                            </time>
                        </div>
                    </div>
                    <div className="timeline-content">
                        <h5 className="title">{t('experience2Title')}</h5>
                        <p className="description">
                            {t('experience2Description')}
                        </p>
                    </div>
                </article>

            </div>
        </div>
    );
};

export default Experience;
