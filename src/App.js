import React, { useState, useEffect } from 'react';
import Navbar from "./components/Navbar";
import Intro from "./components/Intro";
import Experience from "./components/Experience";
import About from "./components/About";
import './style/App.css';
import './style/About.css';
import './style/Experience.css'
function App() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
        document.body.classList.toggle('light-mode', !darkMode);
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
