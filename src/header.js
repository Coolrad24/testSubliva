import React, { useState, useEffect } from 'react'; // Import your CSS files here

const Header = () => {
    const [settings, setSettings] = useState({});
    const [user, setUser] = useState(null);

    // Fetch site settings and user info when the component mounts
    useEffect(() => {
        // Replace with actual API calls
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data));

        fetch('/api/user')
            .then(res => res.json())
            .then(userData => setUser(userData));
    }, []);

    return (
        <header className="main-header fixed-header">
            <div className="header-lower">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="inner-container d-flex justify-content-evenly align-items-center">
                            {/* Logo Box */}
                            <div className="logo-box mobile">
                                <div className="logo">
                                    <a href="/">
                                        <img src={`/admin/upload/${settings.logoPath}`} alt="logo" width="174" height="44" />
                                    </a>
                                </div>
                            </div>

                            <div className="nav-outer">
                                <nav className="main-menu show navbar-expand-md">
                                    <div className="navbar-collapse collapse clearfix">
                                        <ul className="navigation clearfix">
                                            <li className="home"><a href="/add-property">List a Property</a></li>
                                            <li className="dropdown2">
                                                <a href="#">Find a Roommate</a>
                                                <ul>
                                                    <li><a href="/search">Roommate Matching</a></li>
                                                    <li><a href="/tips">Tips for Finding Roommates</a></li>
                                                    <li><a href="/post-ad">Post a Roommate Ad</a></li>
                                                </ul>
                                            </li>
                                            <li className="dropdown2">
                                                <a href="#">Find an Agent</a>
                                                <ul>
                                                    <li><a href="/agents">Real Estate Agents</a></li>
                                                    <li><a href="/property-manager">Property Managers</a></li>
                                                </ul>
                                            </li>
                                            {/* Logo in the middle */}
                                            <li>
                                                <div className="logo-box desktop">
                                                    <div className="logo">
                                                        <a href="/">
                                                            <img src={`/admin/upload/${settings.logoPath}`} alt="logo" width="150" height="52" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </li>
                                            <li><a href="/messages">Messages</a></li>
                                            <li className="dropdown2">
                                                <a href="#">Help</a>
                                                <ul>
                                                    <li><a href="/faq">FAQs</a></li>
                                                    <li><a href="/contact">Contact Us</a></li>
                                                </ul>
                                            </li>
                                            <li className="dropdown2">
                                                <a href="#">Promotions</a>
                                                <ul>
                                                    <li><a href="/offers">Current Offers</a></li>
                                                    <li><a href="/partners">Partner Programs</a></li>
                                                </ul>
                                            </li>
                                            {user ? (
                                                <li className="dropdown2 desktop">
                                                    <a href="#">
                                                        &nbsp;
                                                        {user.image ? (
                                                            <img src={`/admin/upload/user/${user.image}`} alt="avatar" style={{ height: '30px', width: '30px', borderRadius: '50%' }} />
                                                        ) : (
                                                            <img src="/images/avatar/account.jpg" alt="avatar" style={{ height: '30px', width: '30px', borderRadius: '50%' }} />
                                                        )}
                                                        &nbsp;
                                                    </a>
                                                    <ul>
                                                        <li><a href="/dashboard">Dashboard</a></li>
                                                        <li><a href="/my-properties">My Properties</a></li>
                                                        <li><a href="/messages">Messages</a></li>
                                                        <li><a href="/membership">Membership</a></li>
                                                        <li><a href="/my-invoices">My Invoices</a></li>
                                                        <li><a href="/my-favourites">My Favorites</a></li>
                                                        <li><a href="/my-reviews">Reviews</a></li>
                                                        <li><a href="/my-profile">My Profile</a></li>
                                                        <li><a href="/add-property">Add Property</a></li>
                                                        <li><a href="/login?action=logout">Logout</a></li>
                                                    </ul>
                                                </li>
                                            ) : (
                                                <li className="dropdown2 desktop">
                                                    <a href="#">
                                                        &nbsp;
                                                        <img src="/images/avatar/account.png" alt="avatar" style={{ height: '30px', width: '30px' }} />
                                                        &nbsp;
                                                    </a>
                                                    <ul>
                                                        <li><a href="/login">Login</a></li>
                                                        <li><a href="/register">Register</a></li>
                                                    </ul>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </nav>
                            </div>

                            {/* Mobile Menu Toggle */}
                            <div className="mobile-nav-toggler mobile-button"><span></span></div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
