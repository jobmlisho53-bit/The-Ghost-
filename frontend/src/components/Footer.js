import React from 'react';

const Footer = () => {
  return (
    <nav className="bottom-nav">
      <a href="#" className="nav-item active">
        <i className="fas fa-home nav-icon"></i>
        <span className="nav-label">Home</span>
      </a>
      <a href="#" className="nav-item">
        <i className="fas fa-compass nav-icon"></i>
        <span className="nav-label">Explore</span>
      </a>
      <a href="#" className="nav-item">
        <i className="fas fa-bolt nav-icon"></i>
        <span className="nav-label">Shorts</span>
      </a>
      <a href="#" className="nav-item">
        <i className="fas fa-user-circle nav-icon"></i>
        <span className="nav-label">Profile</span>
      </a>
    </nav>
  );
};

export default Footer;
