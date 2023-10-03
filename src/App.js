import React from 'react';
import ReactDOM from "react-dom/client";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import Navbar from "./components/Navbar"
import './App.css'
import Intro from "./components/Intro";
import Experience from "./components/Experience";
import About from "./components/About";
import './style/About.css'


import { Button } from 'reactstrap';
import $ from 'jquery';


function App() {
  return (
     <>
         <Navbar/>
         <Intro/>
         <About/>
         <Experience/>

     </>
  );
}

export default App;
