import React from 'react';
import ReactDOM from "react-dom/client";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import Navbar from "./components/Navbar"
import './App.css'
import Intro from "./components/Intro";


import { Button } from 'reactstrap';
import $ from 'jquery';


function App() {
  return (
     <>
      <Navbar/>
      <Intro/>
     </>
  );
}

export default App;
