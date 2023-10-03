import React from "react";
import $ from 'jquery';


const Navbar = () => {
    function scrollToExperience() {
        $('html, body').animate({
            scrollTop: $('#experience-section').offset().top
        }, 500); // Tempo de animação em milissegundos (1 segundo no exemplo)
    }

    function scrollToAbout() {
        $('html, body').animate({
            scrollTop: $('#about-section').offset().top
        }, 500); // Tempo de animação em milissegundos (1 segundo no exemplo)
    }

    return(



        <div >
            <nav className="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">

                <div className="container-fluid">
                    <a className="navbar-brand mx-auto" href="#">RR</a> {/* Adicione a classe "mx-auto" */}
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item active">
                                <a className="nav-link" aria-current="page" href="#">Home</a>
                            </li>
                            <li className="nav-item active">
                                <a className="nav-link" aria-current="page" onClick={scrollToAbout}>About</a>
                            </li>
                            <li className="nav-item active">
                                <a className="nav-link" aria-current="page" onClick={scrollToExperience}> Experience</a>
                            </li>
                            <li className="nav-item active">
                                <a className="nav-link" aria-current="page" href="#">Projects</a>
                            </li>
                        </ul>
                    </div>
                </div>

            </nav>
        </div>
    )
}

export default Navbar