import React, { useState, useEffect } from 'react';
import Navbar from "./components/Navbar";
import Intro from "./components/Intro";
import Experience from "./components/Experience";
import About from "./components/About";
import './style/App.css';
import './style/About.css';
import './style/Experience.css'
function App() {

    return (
        <>
            <Navbar />
            <Intro/>
            <About/>
            <Experience/>
        </>
    );
}

export default App;
