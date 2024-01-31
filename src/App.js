import React, { useEffect } from 'react';
import ReactDOM from "react-dom/client";
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa apenas o arquivo minificado para evitar redundância.
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Importe o JavaScript do Bootstrap
import 'jquery/dist/jquery.min.js'; // Importe o jQuery se necessário
import Navbar from "./components/Navbar";
import './style/App.css';
import Intro from "./components/Intro";
import Experience from "./components/Experience";
import About from "./components/About";
import './style/Experience.css';
import './style/About.css';
import { Button } from 'reactstrap'; // Certifique-se de que você realmente precisa disso aqui.

// Se você não está usando jQuery em outros lugares, considere remover.
import $ from 'jquery';

function App() {
    useEffect(() => {
        document.body.classList.add('smooth-scroll');
    }, []);

    return (
        <>
            <Navbar />
            <Intro />
            <About />
            <Experience />
        </>
    );
}

export default App;
