import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePlayZone } from '../../context/PlayZoneContext';

// Razorpay test key ID from .env
const RAZORPAY_KEY_ID = 'rzp_test_TV2keyN4sXTDvB';

const PACKAGES = [
  { coins: 500, price: 49, label: 'Starter', id: 'starter' },
  { coins: 1200, price: 99, label: 'Regular', id: 'regular', popular: true },
  { coins: 3000, price: 199, label: 'Pro Pack', id: 'pro' },
  { coins: 7500, price: 399, label: 'High Roller', id: 'highroller' },
];

const PaymentModal = ({ onClose }) => {
  const { user, token } = useAuth();
  const { updateBalance } = usePlayZone();
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[1]); // default Regular
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Razorpay SDK failed to load. Check your internet connection.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create order on backend
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: selectedPkg.price }),
      });
      const data = await res.json();

      if (!data.success) {
        alert('Failed to create order: ' + data.message);
        setIsLoading(false);
        return;
      }

      // 2. Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'PlayZone',
        description: `${selectedPkg.coins} Virtual Coins`,
        order_id: data.order.id,
        handler: async (response) => {
          // 3. Verify payment on backend
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              coinsToAdd: selectedPkg.coins,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            // 4. Update local balance
            updateBalance(selectedPkg.coins, 'Win', 'Razorpay Top-Up');
            setSuccess(true);
          } else {
            alert('Payment verification failed!');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#7c5cff',
        },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
      setIsLoading(false);
    } catch (err) {
      alert('Payment error: ' + err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="payment-modal">
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: 'var(--accent-success)', marginBottom: '0.5rem' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              <strong style={{ color: 'var(--accent-gold)' }}>{selectedPkg.coins.toLocaleString()} coins</strong> have been added to your wallet!
            </p>
            <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={onClose}>
              Continue Playing <i className="fas fa-gamepad"></i>
            </button>
          </div>
        ) : (
          <>
            <div className="payment-header">
              <h2><i className="fas fa-coins" style={{ color: 'var(--accent-gold)' }}></i> Add Coins</h2>
              <p>Choose a coin package and pay securely via Razorpay</p>
            </div>

            <div className="coin-packages">
              {PACKAGES.map(pkg => (
                <div
                  key={pkg.id}
                  className={`coin-package ${selectedPkg.id === pkg.id ? 'selected' : ''} ${pkg.popular ? 'popular' : ''}`}
                  onClick={() => setSelectedPkg(pkg)}
                >
                  <div className="pkg-label">{pkg.label}</div>
                  <div className="pkg-coins">{pkg.coins.toLocaleString()}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>coins</div>
                  <div className="pkg-price">₹{pkg.price}</div>
                </div>
              ))}
            </div>

            <button className="pay-btn" onClick={handlePayment} disabled={isLoading}>
              {isLoading
                ? <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                : <><i className="fas fa-lock"></i> Pay ₹{selectedPkg.price} → Get {selectedPkg.coins.toLocaleString()} Coins</>
              }
            </button>

            <div className="rzp-secure-note">
              <i className="fas fa-shield-alt"></i> Secured by Razorpay · Test Mode Active
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
