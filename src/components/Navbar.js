import React from "react";
import $ from 'jquery';


const Navbar = () => {


    const handleHomeClick = () => {
        // Redirect to the home page
        window.location.href = "/";
    };


    return(



        <div >
            <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top" data-bs-theme="dark">

                <div className="container-fluid">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item active">
                                <a className="nav-link" aria-current="page" href="#" onClick={handleHomeClick}>Home</a>
                            </li>
                            <li className="nav-item active">
                                <a className="nav-link" aria-current="page" href="#about-section">About</a>
                            </li>
                            <li className="nav-item active">
                                <a className="nav-link" href="#experience-section">Experience</a>
                            </li>
                        </ul>
                    </div>
                </div>

            </nav>
        </div>
    )
}

export default Navbar