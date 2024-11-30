import React from "react";

const Footer = () => {
  return (
    <footer className="bg-blue-700 text-white py-6">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        <h5 className="text-lg font-bold mb-4">Follow Us</h5>
        <div className="flex justify-center space-x-6 mb-6">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            <i className="fab fa-instagram fa-lg"></i>
          </a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            <i className="fab fa-linkedin fa-lg"></i>
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            <i className="fab fa-facebook fa-lg"></i>
          </a>
          <a
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            <i className="fab fa-tiktok fa-lg"></i>
          </a>
        </div>
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Subliva. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
