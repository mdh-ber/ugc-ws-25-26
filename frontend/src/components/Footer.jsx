import React from "react";
import FeedbackModal from "../pages/Feedback";
const Footer = () => {    
    return    <footer className="absolute inset-x-0 bottom-0 ">  
        <p className="flex justify-end">
         
         <FeedbackModal />
       
        </p>
        <p className="text-center text-gray-500 ">© 2024 Your Company. All rights reserved.</p>
      </footer>
};

export default Footer;