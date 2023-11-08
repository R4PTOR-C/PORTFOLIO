// CollegeContentPage.js
import CollegeContent from "./College_content";
import React, { useEffect } from 'react';

const CollegeContentPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <div>
            <CollegeContent/>
        </div>
    );
};

export default CollegeContentPage;
