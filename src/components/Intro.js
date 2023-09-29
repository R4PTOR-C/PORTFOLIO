import React from "react";

const Intro = () =>{
    return(
        <div className="intro-wraper">
            <div className="main-info">
                <span className={"hello"}>Hello, </span> <br/>
                <span className={"introText"}>I'm <span className={"introName"}>Rafael, </span><br/>Full Stack Developer</span>
                <p className={"introPara"}>I am a junior web developer with experience in both Front-End and Back-End</p>
            </div>
        </div>
    )
}

export default Intro;