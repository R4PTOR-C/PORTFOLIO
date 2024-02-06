import React from "react";
import { ReactComponent as MoonIcon } from '../assets/moon_icon.svg';
import { ReactComponent as SunIcon } from '../assets/sun_icon.svg';
const Navbar = ({ darkMode, setDarkMode }) => {
    return(

        <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top" data-bs-theme="dark">
            <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="#">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#about-section">About</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#experience-section">Experience</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#projects-section">Projects</a>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                               aria-expanded="false">
                                Idioms
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li><a className="dropdown-item" href="#">Inglês</a></li>
                                <li><a className="dropdown-item" href="#">Português</a></li>
                            </ul>
                        </li>
                        <button className="toggle-button" onClick={() => setDarkMode(!darkMode)}>
                            {darkMode ? <SunIcon/> : <MoonIcon/> }
                        </button>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
