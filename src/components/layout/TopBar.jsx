import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayZone } from '../../context/PlayZoneContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';

const TopBar = ({ hideWallet = false }) => {
  const navigate = useNavigate();
  const { balance } = usePlayZone();
  const { user } = useAuth();
  
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleWalletClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate('/wallet');
  };

  return (
    <div className="top-bar">
      <div className="logo-mobile">PLAYZONE</div>
      
      <div 
        className="wallet-display" 
        style={{ opacity: hideWallet ? 0.5 : 1, cursor: 'pointer' }}
        onClick={handleWalletClick}
      >
        <i className="fas fa-rupee-sign" style={{ fontSize: '1.1rem', marginRight: '2px', color: 'var(--accent-gold)' }}></i>
        <span className="wallet-balance">{(balance || 0).toFixed(2)}</span>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default TopBar;
