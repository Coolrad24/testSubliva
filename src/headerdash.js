import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom'; // assuming you are using react-router for navigation
import './Header.css'; // Import your CSS files

const Header = () => {
  const [settings, setSettings] = useState({});
  const [user, setUser] = useState({});
  const history = useHistory(); // for programmatic navigation
  
  // Fetch site settings and user details on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings'); // Replace with your API endpoint
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user'); // Replace with your API endpoint
        const data = await response.json();
        if (data) {
          setUser(data);
        } else {
          history.push('/login'); // Redirect if user not logged in
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        history.push('/login');
      }
    };

    fetchSettings();
    fetchUser();
  }, [history]);

  const handleLogout = () => {
    // Handle logout logic, clear session, etc.
    fetch('/api/logout', { method: 'POST' })
      .then(() => {
        history.push('/login');
      })
      .catch((error) => console.error('Logout error:', error));
  };

  return (
    <header className="main-header fixed-header header-dashboard">
      <div className="header-lower">
        <div className="row">
          <div className="col-lg-12">
            <div className="inner-container d-flex justify-content-evenly align-items-center">
              {/* Logo Box */}
              <div className="logo-box">
                <div className="logo">
                  <Link to="/">
                    <img
                      src={settings.logoPath ? `/admin/upload/${settings.logoPath}` : '/images/logo/default-logo.png'}
                      alt="logo"
                      width="174"
                      height="44"
                    />
                  </Link>
                </div>
              </div>

              {/* Main Navigation */}
              <nav className="main-menu">
                <ul className="navigation">
                  <li><Link to="/add-property">List a Property</Link></li>
                  <li className="dropdown">
                    <span>Find a Roommate</span>
                    <ul>
                      <li><Link to="/search">Roommate Matching</Link></li>
                      <li><Link to="/tips">Tips for Finding Roommates</Link></li>
                      <li><Link to="/post-ad">Post a Roommate Ad</Link></li>
                    </ul>
                  </li>
                  <li className="dropdown">
                    <span>Find an Agent</span>
                    <ul>
                      <li><Link to="/agents">Real Estate Agents</Link></li>
                      <li><Link to="/property-managers">Property Managers</Link></li>
                    </ul>
                  </li>
                  <li><Link to="/messages">Messages</Link></li>
                  <li className="dropdown">
                    <span>Help</span>
                    <ul>
                      <li><Link to="/faq">FAQs</Link></li>
                      <li><Link to="/contact">Contact Us</Link></li>
                    </ul>
                  </li>
                  <li className="dropdown">
                    <span>Promotions</span>
                    <ul>
                      <li><Link to="/offers">Current Offers</Link></li>
                      <li><Link to="/partners">Partner Programs</Link></li>
                    </ul>
                  </li>
                  
                  {/* User Profile Dropdown */}
                  {user && (
                    <li className="dropdown">
                      <span>
                        <img
                          src={user.userImage ? `/admin/upload/user/${user.userImage}` : '/images/avatar/account.jpg'}
                          alt="avatar"
                          style={{ height: '30px', width: '30px', borderRadius: '50%' }}
                        />
                      </span>
                      <ul>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/my-properties">My Properties</Link></li>
                        <li><Link to="/messages">Messages</Link></li>
                        <li><Link to="/membership">Membership</Link></li>
                        <li><Link to="/my-invoices">My Invoices</Link></li>
                        <li><Link to="/my-favorites">My Favorites</Link></li>
                        <li><Link to="/my-reviews">Reviews</Link></li>
                        <li><Link to="/my-profile">My Profile</Link></li>
                        <li><Link to="/add-property">Add Property</Link></li>
                        <li onClick={handleLogout}>Logout</li>
                      </ul>
                    </li>
                  )}
                </ul>
              </nav>

              {/* Mobile Navigation for small screens */}
              <div className="mobile-nav-toggler">
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
