import React from "react";
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
                                <svg className="icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21 12.79C20.84 17.8 16.76 22 11.75 22C6.74 22 2.5 17.76 2.5 12.75C2.5 7.74 6.8 3.5 11.81 3.5C12.55 3.5 13.28 3.57 14 3.71C13.03 5.06 12.5 6.7 12.5 8.5C12.5 11.54 14.96 14 18 14C19.8 14 21.44 13.47 22.79 12.5C22.57 12.82 22.36 13.14 22.16 13.45C21.68 14.2 21.11 14.89 20.48 15.51C19.02 16.97 17.12 17.96 15.05 18.41C13.49 18.76 11.83 18.92 10.16 18.86C6.36 18.75 3.16 15.85 3.05 12.05C2.99 10.38 3.15 8.72 3.5 7.16C3.95 5.09 4.94 3.19 6.4 1.73C7.02 1.1 7.71 0.53 8.46 0.05C8.77 -0.14 9.09 -0.35 9.41 -0.54C9.13 -0.43 8.85 -0.3 8.57 -0.16C4.7 1.74 2 5.74 2 10.25C2 15.25 6.24 19.5 11.25 19.5C15.76 19.5 19.76 16.8 21.66 12.93C21.8 12.65 21.93 12.37 22.04 12.09C21.96 12.33 21.87 12.56 21.79 12.79H21Z"/>
                                </svg>                            </svg>
                        </button>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
