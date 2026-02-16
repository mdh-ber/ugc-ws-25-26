import React from "react";
import FeedbackModal from "../pages/Feedback";

const Footer = () => {
  return (
    <footer className="w-full border-t bg-white">
      <div className="flex items-center justify-between px-6 h-12">
        <p className="text-xs text-gray-500">
          © 2024 Your Company
        </p>

        <FeedbackModal />
      </div>
    </footer>
  );
};

export default Footer;
