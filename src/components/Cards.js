import React from "react";
import { Link } from "react-router-dom";

const Cards = () => {
    return (
        <div id="cards-section" className="container d-flex justify-content-center align-items-center" style={{ height: "100vh"}}>
            <Link to="/college-content" className="card" style={{ width: "18rem", height: "300px", textDecoration: "none", cursor: "pointer" }}>
                <div className="card-body d-flex flex-column justify-content-center">
                    <h5 className="card-title text-center">COMPLEXIDADE DE ALGORITMOS</h5>
                    <p className="card-text text-center">Conteúdo da matéria de complexidade de algorítmos</p>
                </div>
            </Link>
        </div>

    );
}
export default Cards;
