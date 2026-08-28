import React from 'react';
import { NavLink } from 'react-router-dom';

const MobileNav = () => {
  return (
    <nav className="mobile-nav">
      <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} end>
        <i className="fas fa-home"></i>
        <span>Home</span>
      </NavLink>
      <NavLink to="/games" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <i className="fas fa-gamepad"></i>
        <span>Games</span>
      </NavLink>
      <NavLink to="/rewards" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <i className="fas fa-gift"></i>
        <span>Rewards</span>
      </NavLink>
      <NavLink to="/leaderboard" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <i className="fas fa-trophy"></i>
        <span>Leaders</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <i className="fas fa-user"></i>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;
