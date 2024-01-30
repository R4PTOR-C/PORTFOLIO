import React, { useEffect } from 'react'; // Import useEffect from 'react'

import ReactDOM from "react-dom/client";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import Navbar from "./components/Navbar"
import './style/App.css'
import Intro from "./components/Intro";
import Experience from "./components/Experience";
import About from "./components/About";
import './style/About.css'
import './style/Experience.css'


import { Button } from 'reactstrap';
import $ from 'jquery';


function App() {
    useEffect(() => {
        // Add the smooth-scroll class to the body
        document.body.classList.add('smooth-scroll');
    }, []);

    return (
        <>
            <Navbar/>
            <Intro/>
            <About/>
            <Experience/>

        </>
    );
}
document.body.classList.add('smooth-scroll');

export default App;
