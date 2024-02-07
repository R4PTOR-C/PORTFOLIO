import React, { useState, useEffect } from 'react';
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
        <>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <Intro />
            <About />
            <Experience />
        </>
    );
}


export default App;
