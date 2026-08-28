import React, { useState } from 'react';

const WithdrawModal = ({ onClose }) => {
  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="payment-modal">
        <div className="payment-header">
          <h2>Withdraw Funds</h2>
          <p>Transfer your winnings to your bank account.</p>
        </div>

        <div style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-muted)' }}>
          <i className="fas fa-tools" style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}></i>
          <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Coming Soon!</h3>
          <p style={{ fontSize: '0.9rem' }}>We are currently integrating secure payouts. Withdrawals will be available in the next update.</p>
        </div>

        <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
};

export default WithdrawModal;
