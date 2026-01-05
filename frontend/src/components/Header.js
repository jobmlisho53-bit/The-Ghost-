import React from 'react';
import { useApp } from '../contexts/AppContext';
import authService from '../services/authService';

const Header = () => {
  const { isAuthenticated, user, logout } = useApp();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="main-header">
      <div className="header-top">
        <div className="logo-wrapper">
          <div className="logo-orb">
            <div className="logo-orb-inner"></div>
          </div>
          <div className="logo-text">GHOST</div>
        </div>
        <div className="header-controls">
          <i className="fas fa-search header-icon"></i>
          <i className="fas fa-bell header-icon notification"></i>
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="username">{user.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt header-icon"></i>
              </button>
            </div>
          ) : (
            <a href="/login" className="login-link">
              <i className="fas fa-user-circle header-icon"></i>
            </a>
          )}
        </div>
      </div>
      <div className="search-container">
        <i className="fas fa-search search-icon"></i>
        <input type="text" className="search-bar" placeholder="Search AI-generated videos..." />
      </div>
    </header>
  );
};

export default Header;
