import React from "react";
import { useTranslation } from 'react-i18next';

const Intro = () => {
    const { t } = useTranslation();

    return(
        <div className="intro-wraper">
            <div className="main-info">
                <span className="hello">{t('introHello')}</span> <br/>
                <span className="introText">{t('introIm')}<span className="introName">{t('introName')}</span><br/>{t('introRole')}</span>
                <p className="introPara">{t('introDescription')}</p>
            </div>
        </div>
    );
}

export default Intro;
