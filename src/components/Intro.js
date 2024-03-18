import React from "react";
import { useTranslation } from 'react-i18next';

const Intro = ({darkMode}) => {
    const { t } = useTranslation();

    return(
        <div className="intro-wraper">
            <div className="main-info">
                <span className="hello">{t('introHello')}</span> <br/>
                <span className="introText">{t('introIm')}<span
                    className="introName">{t('introName')}</span><br/>{t('introRole')}</span>
                <p className="introPara">{t('introDescription')}</p>
                <div className="d-flex flex-row flex-wrap align-items-center mx">
                    <a href="https://github.com/R4PTOR-C" target="_blank" rel="noopener noreferrer">
                        <img
                            src="https://img.shields.io/badge/-GitHub-%23181717?style=for-the-badge&logo=github&logoColor=white"
                            alt="GitHub"/>
                    </a>
                    <a href="https://www.linkedin.com/in/rafael-caldas-76174b207" target="_blank"
                       rel="noopener noreferrer">
                        <img
                            src="https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white"
                            alt="LinkedIn"/>
                    </a>
                    <a href="https://instagram.com/rafaelroriz7" target="_blank" rel="noopener noreferrer">
                        <img
                            src="https://img.shields.io/badge/-Instagram-%23E4405F?style=for-the-badge&logo=instagram&logoColor=white"
                            alt="Instagram"/>
                    </a>
                    <a href="mailto:rafaelcroriz7@gmail.com" target="_blank" rel="noopener noreferrer">
                        <img id="gmail-light"
                             src="https://img.shields.io/badge/-Gmail-%23333?style=for-the-badge&logo=gmail&logoColor=white"
                             style={{display: darkMode ? 'none' : 'inline'}} alt="Gmail"/>
                        <img id="gmail-dark"
                             src="https://img.shields.io/badge/-Gmail-white?style=for-the-badge&logo=gmail&logoColor=%23333"
                             style={{display: darkMode ? 'inline' : 'none'}} alt="Gmail Dark Mode"/>
                    </a>
                </div>
            </div>

        </div>


    );
}

export default Intro;