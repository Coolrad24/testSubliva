// Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebaseconfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import './Navbar.css';
const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav
    className={`navbar fixed top-0 w-full z-20 transition-all duration-300 ${
      isScrolled ? "navbar-shrink" : "navbar-default"
    }`}
  >
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo and Name */}
        <Link
          to="/"
          className="flex items-center space-x-3 text-gray-800"
        >
          <img
            src="/images/logo/favicon.jpg" 
            alt="Subliva Logo"
            className="w-8 h-8 object-cover"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap">
            Subliva
          </span>
        </Link>
  
        {/* Right-side Buttons */}
        <div className="flex md:order-2 space-x-3 rtl:space-x-reverse">
          {!isAuthenticated ? (
            <>
              <button
                type="button"
                className="text-gray-800 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2"
                onClick={() => navigate("/signin")}
              >
                Log In
              </button>
              <button
                data-collapse-toggle="navbar-sticky"
                type="button"
                className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-800 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-controls="navbar-sticky"
                aria-expanded={isMenuOpen}
                onClick={toggleMenu}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 17 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1h15M1 7h15M1 13h15"
                  />
                </svg>
              </button>
            </>
          ) : (
            <>
              {/* My Account Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center text-gray-800 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg px-4 py-2 text-sm"
                  onClick={toggleDropdown}
                >
                  <span className="mr-2">My Account</span>
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
  
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md z-50 border border-gray-200">
                    <ul className="py-2">
                      <li>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                        >
                          Settings
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/messages"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                        >
                          Messages
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/properties"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                        >
                          My Properties
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                        >
                          My Subleases
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/saved"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                        >
                          Saved Properties
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleSignOut}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                        >
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>  
        {/* Navbar Links */}
        <div
          className={`items-center justify-between ${
            isMenuOpen ? "block" : "hidden"
          } w-full md:flex md:w-auto md:order-1`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
            <li>
              <Link
                to="/sublease/apartments"
                className="block py-2 px-3 rounded md:bg-transparent text-gray-800 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-600"
                aria-current="page"
              >
                Sublease
              </Link>
            </li>
            <li>
              <Link
                to="/list"
                className="block py-2 px-3 rounded text-gray-800 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-600"
              >
                List a Property
              </Link>
            </li>
            <li>
              <Link
                to="/roommate/matching"
                className="block py-2 px-3 rounded text-gray-800 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-600"
              >
                Find a Roommate
              </Link>
            </li>
            <li>
              <a
                href="/blogs"
                className="block py-2 px-3 rounded text-gray-800 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-600"
              >
                Blogs
              </a>
            </li>
          </ul>

        </div>
      </div>
    </nav>
  );
  
};

export default Navbar;
