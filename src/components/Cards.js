import React from "react";
import { Link } from "react-router-dom";

const Cards = () => {
    return (
        <>

            <div className="row justify-content-center align-items-center" style={{ height: "100vh" }}>
                <div className="col-sm-2 mb-3 mb-sm-0">
                    <div id="cards-section" className="container d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
                        <Link to="/notacao-assintotica" className="card" style={{ width: "18rem", height: "300px", textDecoration: "none", cursor: "pointer" }}>
                            <div className="card-body d-flex flex-column justify-content-center">
                                <h5 className="card-title text-center">COMPLEXIDADE DE ALGORITMOS</h5>
                                <p className="card-text text-center">NOTAÇÃO ASSINTÓTICA</p>
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="col-sm-2 mb-3 mb-sm-0">
                    <div id="cards-section" className="container d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
                        <Link to="/complexidade-pessimista" className="card" style={{ width: "18rem", height: "300px", textDecoration: "none", cursor: "pointer" }}>
                            <div className="card-body d-flex flex-column justify-content-center">
                                <h5 className="card-title text-center">COMPLEXIDADE DE ALGORITMOS</h5>
                                <p className="card-text text-center">COMPLEXIDADE PESSIMISTA</p>
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="col-sm-2 mb-3 mb-sm-0">
                    <div id="cards-section" className="container d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
                        <Link to="/algoritmos-gulosos" className="card" style={{ width: "18rem", height: "300px", textDecoration: "none", cursor: "pointer" }}>
                            <div className="card-body d-flex flex-column justify-content-center">
                                <h5 className="card-title text-center">COMPLEXIDADE DE ALGORITMOS</h5>
                                <p className="card-text text-center">ALGORITMOS GULOSOS</p>
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="col-sm-2 mb-3 mb-sm-0">
                    <div id="cards-section" className="container d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
                        <Link to="/complexidade-problemas" className="card" style={{ width: "18rem", height: "300px", textDecoration: "none", cursor: "pointer" }}>
                            <div className="card-body d-flex flex-column justify-content-center">
                                <h5 className="card-title text-center">COMPLEXIDADE DE ALGORITMOS</h5>
                                <p className="card-text text-center">COMPLEXIDADE DE PROBLEMAS</p>
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="col-sm-2 mb-3 mb-sm-0">
                    <div id="cards-section" className="container d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
                        <Link to="/classes" className="card" style={{ width: "18rem", height: "300px", textDecoration: "none", cursor: "pointer" }}>
                            <div className="card-body d-flex flex-column justify-content-center">
                                <h5 className="card-title text-center">COMPLEXIDADE DE ALGORITMOS</h5>
                                <p className="card-text text-center">CLASSES P, NP E NP-COMPLETO</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

        </>
    );
}

export default Cards;
