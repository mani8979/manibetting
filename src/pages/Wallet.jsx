import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { usePlayZone } from '../context/PlayZoneContext';

const RAZORPAY_KEY_ID = 'rzp_test_TV2keyN4sXTDvB';

const PACKAGES = [
  { amount: 50, label: 'Starter', id: 'starter' },
  { amount: 100, label: 'Regular', id: 'regular', popular: true },
  { amount: 500, label: 'Pro Pack', id: 'pro' },
  { amount: 1000, label: 'High Roller', id: 'highroller' },
];

const Wallet = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'deposit';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const { user, token } = useAuth();
  const { balance, updateBalance } = usePlayZone();
  
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[1]);
  const [customAmount, setCustomAmount] = useState('');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const getDepositAmount = () => {
    if (customAmount && Number(customAmount) > 0) {
      return Number(customAmount);
    }
    return selectedPkg ? selectedPkg.amount : 0;
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPkg(pkg);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedPkg(null);
  };

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
    if (!user) {
      alert("Please login first.");
      return;
    }

    const depositAmount = getDepositAmount();
    if (depositAmount <= 0) {
      alert("Please enter a valid deposit amount.");
      return;
    }

    setIsLoading(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Razorpay SDK failed to load. Check your internet connection.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: depositAmount }),
      });
      const data = await res.json();

      if (!data.success) {
        alert('Failed to create order: ' + data.message);
        setIsLoading(false);
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'PlayZone',
        description: `Add ₹${depositAmount} to Wallet`,
        order_id: data.order.id,
        handler: async (response) => {
          const verifyRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payment/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              coinsToAdd: depositAmount,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            updateBalance(depositAmount, 'Win', 'Razorpay Top-Up');
            setSuccess(true);
          } else {
            alert('Payment verification failed!');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#7c5cff' },
        modal: { ondismiss: () => setIsLoading(false) },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
      setIsLoading(false);
    } catch (err) {
      alert('Payment error: ' + err.message);
      setIsLoading(false);
    }
  };

  const handleWithdraw = () => {
    if (!user) {
      alert("Please login first.");
      return;
    }
    
    const amt = Number(withdrawAmount);
    if (isNaN(amt) || amt < 200) {
      alert("Minimum withdrawal is ₹200.");
      return;
    }
    if (amt > balance) {
      alert("Insufficient balance.");
      return;
    }

    setIsLoading(true);
    
    // Mock withdrawal process
    setTimeout(() => {
      updateBalance(-amt, 'Loss', 'Withdrawal Request');
      setWithdrawSuccess(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="page-container animate-fade-in">
      <TopBar hideWallet={true} />
      
      <div className="section-title">
        <i className="fas fa-wallet" style={{ color: 'var(--accent-primary)' }}></i> My Wallet
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border-glass)', boxShadow: 'var(--shadow-glass)' }}>
        
        {/* Wallet Balance Summary */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-glass)' }}>
            <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '0.5rem' }}>Current Balance</p>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
                <i className="fas fa-rupee-sign" style={{ fontSize: '2.5rem', marginRight: '10px' }}></i>
                {(balance || 0).toFixed(2)}
            </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" style={{ marginBottom: '2rem' }}>
          <button className={`auth-tab ${activeTab === 'deposit' ? 'active' : ''}`} onClick={() => setActiveTab('deposit')}>
             <i className="fas fa-plus-circle" style={{ marginRight: '5px' }}></i> Deposit
          </button>
          <button className={`auth-tab ${activeTab === 'withdraw' ? 'active' : ''}`} onClick={() => setActiveTab('withdraw')}>
             <i className="fas fa-money-bill-wave" style={{ marginRight: '5px' }}></i> Withdraw
          </button>
        </div>

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="animate-fade-in">
            {success ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h2 style={{ color: 'var(--accent-success)', marginBottom: '0.5rem' }}>Payment Successful!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                  <strong style={{ color: 'var(--accent-gold)' }}>₹{getDepositAmount().toFixed(2)}</strong> has been added to your wallet!
                </p>
                <button className="btn btn-primary" onClick={() => { setSuccess(false); setCustomAmount(''); setSelectedPkg(PACKAGES[1]); }}>
                  Add More Cash
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>Choose a package or enter a custom amount</p>
                
                <div className="coin-packages">
                  {PACKAGES.map(pkg => (
                    <div
                      key={pkg.id}
                      className={`coin-package ${selectedPkg?.id === pkg.id ? 'selected' : ''} ${pkg.popular ? 'popular' : ''}`}
                      onClick={() => handlePackageSelect(pkg)}
                    >
                      <div className="pkg-label">{pkg.label}</div>
                      <div className="pkg-coins" style={{ fontSize: '1.5rem' }}>₹{pkg.amount}</div>
                    </div>
                  ))}
                </div>

                <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Custom Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    className="auth-input"
                    placeholder="Enter any amount (e.g. 250)"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                  />
                </div>

                <button className="pay-btn" onClick={handlePayment} disabled={isLoading || getDepositAmount() <= 0} style={{ marginTop: '1rem' }}>
                  {isLoading
                    ? <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                    : <><i className="fas fa-lock"></i> Pay ₹{getDepositAmount()} Securely</>
                  }
                </button>

                <div className="rzp-secure-note" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <i className="fas fa-shield-alt"></i> Secured by Razorpay · Test Mode Active
                </div>
              </>
            )}
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="animate-fade-in">
            {withdrawSuccess ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ color: 'var(--accent-success)', marginBottom: '0.5rem' }}>Withdrawal Requested!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
                  Your request for <strong style={{ color: 'white' }}>₹{Number(withdrawAmount).toFixed(2)}</strong> has been received.<br/>
                  Funds will be credited to your linked bank account within 2-3 business days.
                </p>
                <button className="btn btn-primary" onClick={() => { setWithdrawSuccess(false); setWithdrawAmount(''); }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                  Withdraw your winnings directly to your bank account. <br/>
                  <span style={{ color: 'var(--accent-gold)' }}>Minimum withdrawal: ₹200</span>
                </p>

                <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    min="200"
                    className="auth-input"
                    placeholder="Enter amount (Min: 200)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
                    Available: ₹{(balance || 0).toFixed(2)}
                  </div>
                </div>

                <button 
                  className="pay-btn" 
                  onClick={handleWithdraw} 
                  disabled={isLoading || !withdrawAmount || Number(withdrawAmount) < 200 || Number(withdrawAmount) > balance} 
                  style={{ marginTop: '1rem' }}
                >
                  {isLoading
                    ? <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                    : <><i className="fas fa-money-bill-wave"></i> Request Withdrawal</>
                  }
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
