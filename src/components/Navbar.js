import React from "react";
import { useTranslation } from 'react-i18next';
import { ReactComponent as MoonIcon } from '../assets/moon_icon.svg';
import { ReactComponent as SunIcon } from '../assets/sun_icon.svg';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; // Adicione esta linha

const Navbar = ({ darkMode, setDarkMode }) => {
    const navigate = useNavigate();

    const { t } = useTranslation();

    const { i18n } = useTranslation();

    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
        localStorage.setItem('i18nextLng', language); // Salva a escolha do idioma
    };

    const handleHomeClick = () => {
        navigate('/'); // Navega para a Home
        window.scrollTo(0, 0); // Faz scroll para o topo da página
    };

    return(

        <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top" data-bs-theme="dark">
            <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <button className="toggle-button" onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? <SunIcon/> : <MoonIcon/>}
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <a className="nav-link" onClick={handleHomeClick}>{t('navHome')}</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#about-section">{t('navAbout')}</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#experience-section">{t('navExperience')}</a>
                        </li>
                        {/*
                        <li className="nav-item">
                            <Link className="nav-link" to="/projects">Projects</Link> Corrigido aqui
                        </li>
                        */}
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                               aria-expanded="false">
                                {t('navIdioms')}
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <button className="dropdown-item" type="button"
                                            onClick={() => changeLanguage('en')}>English
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item" type="button"
                                            onClick={() => changeLanguage('pt')}>Português
                                    </button>
                                </li>
                            </ul>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
