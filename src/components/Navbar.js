import React from "react";
import Dropdown from 'react-bootstrap/Dropdown';

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
                                Idiomas
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li><a className="dropdown-item" href="#">Inglês</a></li>
                                <li><a className="dropdown-item" href="#">Português</a></li>
                            </ul>
                        </li>
                        <button className="toggle-button" onClick={() => setDarkMode(!darkMode)}>
                            <svg className="icon-sun" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <svg className="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="5"/>
                                    <line x1="12" y1="1" x2="12" y2="3"/>
                                    <line x1="12" y1="21" x2="12" y2="23"/>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                    <line x1="1" y1="12" x2="3" y2="12"/>
                                    <line x1="21" y1="12" x2="23" y2="12"/>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                                </svg>
                            </svg>
                            <svg className="icon-moon" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <g>
                                        <path fill="none" d="M0 0h24v24H0z"/>
                                        <path fill-rule="nonzero"
                                              d="M10 7a7 7 0 0 0 12 4.9v.1c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2h.1A6.979 6.979 0 0 0 10 7zm-6 5a8 8 0 0 0 15.062 3.762A9 9 0 0 1 8.238 4.938 7.999 7.999 0 0 0 4 12z"/>
                                    </g>
                                </svg>
                            </svg>
                        </button>
                    </ul>
                </div>
            </div>
            </nav>
    );
}

export default Navbar;
