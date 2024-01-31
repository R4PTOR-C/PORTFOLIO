import React from "react";

const Experience = () => {
    return (
        <div id="experience-section" className="container">
            <div className="main-timeline">
                {/* Experiência de desenvolvimento back-end */}
                <article className="timeline">
                    <div className="date-content">
                        <div className="date-outer">
                            <time className="date">
                                <span className="month">2 Years</span>
                                <span className="year">2021</span>
                            </time>
                        </div>
                    </div>
                    <div className="timeline-content">
                        <h5 className="title">Information Technology Intern</h5>
                        <p className="description">
                            Administration and development of websites in Joomla and Wordpress.
                            Development of applications in Oracle APEX using SQL.
                            Integration of SEI with the CHARLES system using Oracle APEX.
                            Documentation and IT process creation.
                            User support, business mapping, and creation of dashboards with Google Data Studio.
                        </p>
                    </div>
                </article>

                <article className="timeline">
                    <div className="date-content">
                        <div className="date-outer">
                            <time className="date">
                                <span className="month">1 Year</span>
                                <span className="year">2023</span>
                            </time>
                        </div>
                    </div>
                    <div className="timeline-content">
                        <h5 className="title">Full Stack Web Development Intern</h5>
                        <p className="description">
                            Development of full-stack web applications using Ruby, HTML, CSS, Javascript, and the Rails
                            framework.
                            Collaboration on development projects and implementation of technological solutions.
                        </p>
                    </div>
                </article>

            </div>
        </div>
    );
};

export default Experience;
