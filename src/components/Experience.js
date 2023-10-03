import React from "react";

const Experience = () => {
    return (
        <div id="experience-section" className="container">
            <div className="main-timeline">
                {/* start experience section*/}
                <div className="timeline">
                    <div className="icon"></div>
                    <div className="date-content">
                        <div className="date-outer">
              <span className="date">
                <span className="month">2 Years</span>
                <span className="year">2021</span>
              </span>
                        </div>
                    </div>
                    <div className="timeline-content">
                        <h5 className="title">Back-end development</h5>
                        <p className="description">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                            efficitur ex sit amet massa scelerisque scelerisque. Aliquam erat
                            volutpat. Aenean interdum finibus efficitur. Praesent dapibus dolor
                            felis, eu ultrices elit molestie.
                        </p>
                    </div>
                </div>
                {/* end experience section*/}

                {/* start experience section*/}
                <div className="timeline">
                    <div className="icon"></div>
                    <div className="date-content">
                        <div className="date-outer">
              <span className="date">
                <span className="month">1 Year</span>
                <span className="year">2023</span>
              </span>
                        </div>
                    </div>
                    <div className="timeline-content">
                        <h5 className="title">Full Stack Web Development</h5>
                        <p className="description">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                            efficitur ex sit amet massa scelerisque scelerisque. Aliquam erat
                            volutpat. Aenean interdum finibus efficitur. Praesent dapibus dolor
                            felis, eu ultrices elit molestie.
                        </p>
                    </div>
                </div>
                {/* end experience section*/}


            </div>
        </div>
    );
};

export default Experience;
