import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePlayZone } from '../../context/PlayZoneContext';
import AuthModal from '../auth/AuthModal';
import PaymentModal from '../payment/PaymentModal';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { resetSession } = usePlayZone();
  const [showAuth, setShowAuth] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const handleLogout = () => {
    logout();
    resetSession();
  };

  return (
    <>
      <aside className="sidebar">
        <div className="logo">PLAYZONE</div>

        {/* Auth / User Section */}
        <div style={{ padding: '0 1.25rem', marginBottom: '1.5rem' }}>
          {user ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <img
                  src={user.avatar}
                  alt="Avatar"
                  onError={e => { e.target.onerror = null; e.target.src = 'https://api.dicebear.com/8.x/pixel-art/svg?seed=' + user.name; }}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--accent-primary)', objectFit: 'cover' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}><i className="fas fa-rupee-sign"></i> {(user.balance || 0).toFixed(2)}</div>
                </div>
              </div>
              <button
                onClick={() => setShowPayment(true)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #f5b83d, #e07b00)', color: '#1a0a00', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '8px' }}
              >
                <i className="fas fa-plus-circle"></i> Add Coins
              </button>
              <button
                onClick={handleLogout}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--accent-danger)', fontWeight: '600', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', borderRadius: '12px' }}
            >
              <i className="fas fa-sign-in-alt"></i> Login / Sign Up
            </button>
          )}
        </div>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <i className="fas fa-home"></i> Home
          </NavLink>
          <NavLink to="/games" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <i className="fas fa-gamepad"></i> Games
          </NavLink>
          <NavLink to="/sports" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <i className="fas fa-futbol"></i> Sports Simulator
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <i className="fas fa-trophy"></i> Leaderboard
          </NavLink>
          <NavLink to="/rewards" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <i className="fas fa-gift"></i> Rewards
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <i className="fas fa-history"></i> History
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <i className="fas fa-user"></i> Profile
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <i className="fas fa-cog"></i> Settings
          </NavLink>
        </nav>
      </aside>

      {/* Modals */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
    </>
  );
};

export default Sidebar;
