import React from "react";
import { useTranslation } from 'react-i18next';

const About = () =>{
    const { t } = useTranslation();

    return(
        <div id="about-section" className="about-wraper">
            <div className="container">
                <p className="aboutPara">{t('aboutParagraph')}</p>
            </div>
        </div>
    )
}

export default About;