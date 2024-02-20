import React from "react";
import { useTranslation } from 'react-i18next';

const Intro = () => {
    const { t } = useTranslation();

    return(
        <div className="intro-wraper">
            <div className="main-info">
                <span className="hello">{t('introHello')}</span> <br/>
                <span className="introText">{t('introIm')}<span
                    className="introName">{t('introName')}</span><br/>{t('introRole')}</span>
                <p className="introPara">{t('introDescription')}</p>
                <a href="https://www.linkedin.com/in/rafael-caldas-76174b207" target="_blank"><img
                    src="https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white"
                    target="_blank"/></a>
                <a href="https://instagram.com/rafaelroriz7" target="_blank"><img
                    src="https://img.shields.io/badge/-Instagram-%23E4405F?style=for-the-badge&logo=instagram&logoColor=white"
                    target="_blank"/></a>
                <a href="mailto: rafaelcroriz7@gmail.com"><img
                    src="https://img.shields.io/badge/-Gmail-%23333?style=for-the-badge&logo=gmail&logoColor=white"
                    target="_blank"/></a>
            </div>

        </div>


    );
}

export default Intro;
