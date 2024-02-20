import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Projects from "./components/Projects";
import Navbar from "./components/Navbar";
import Intro from "./components/Intro";
import Experience from "./components/Experience";
import About from "./components/About";
import './style/App.css';
import './style/About.css';
import './style/Experience.css';
import './i18n';
function App() {
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? savedMode === 'true' : false;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
        document.body.classList.toggle('dark-mode', darkMode);
    }, [darkMode]);

    return (
        <Router>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <Routes>
                <Route path="/projects" element={<Projects />} />
                <Route path="/" element={
                    <>
                        <Intro />
                        <About />
                        <Experience />
                    </>
                } />
            </Routes>
        </Router>

    );
}


export default App;
