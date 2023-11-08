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
                    <Route path="/college-content" element={<CollegeContentPage />} />
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
