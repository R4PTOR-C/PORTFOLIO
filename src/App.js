import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import Navbar from "./components/Navbar"
import './style/App.css'
import Intro from "./components/Intro";
import Experience from "./components/Experience";
import About from "./components/About";
import CollegeContentPage from "./components/CollegeContentPage";
import Cards from "./components/Cards";
import './style/Experience.css'
import './style/About.css'
import './style/CollegeContent.css';

import { Button } from 'reactstrap';
import $ from 'jquery';
import Cont1 from "./components/cont1";
import Cont2 from "./components/cont2";
import Cont3 from "./components/cont3";
import Cont4 from "./components/cont4";
import Cont5 from "./components/cont5";


function App() {
    useEffect(() => {
        // Add the smooth-scroll class to the body
        document.body.classList.add('smooth-scroll');
    }, []);

    return (
        <Router>
            <>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/notacao-assintotica" element={<Cont1 />} />
                    <Route path="/complexidade-pessimista" element={<Cont2 />} />
                    <Route path="/algoritmos-gulosos" element={<Cont3 />} />
                    <Route path="/complexidade-problemas" element={<Cont4 />} />
                    <Route path="/classes" element={<Cont5 />} />

                </Routes>
            </>
        </Router>
    );
}

const Home = () => {
    return (
        <>
            <Intro />
            <Cards />
        </>
    );
};

export default App;
