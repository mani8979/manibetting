import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePlayZone } from '../../context/PlayZoneContext';

// Views: 'login' | 'register' | 'forgot-email' | 'forgot-otp' | 'forgot-reset'
const AuthModal = ({ onClose, defaultView = 'login' }) => {
  const [view, setView] = useState(defaultView);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot password specific states
  const [resetToken, setResetToken] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const { login, register } = useAuth();
  const { initUserSession } = usePlayZone();

  const switchView = (v) => { 
    setView(v); 
    setError(''); 
    setSuccessMsg('');
    if (v === 'login' || v === 'register') {
        setOtp(['', '', '', '', '', '']);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    const result = await login(email, password);
    if (result.success) { initUserSession(result.user); onClose(); }
    else setError(result.message);
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); setIsLoading(false); return; }
    const result = await register(name, email, password);
    if (result.success) { initUserSession(result.user); onClose(); }
    else setError(result.message);
    setIsLoading(false);
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(''); setSuccessMsg('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setView('forgot-otp');
      } else {
        setError(data.message);
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setIsLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
        setError('Please enter the full 6-digit code.');
        return;
    }
    
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();
      if (data.success) {
        setResetToken(data.resetToken);
        setView('forgot-reset');
      } else {
        setError(data.message);
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setIsLoading(false);
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(''); setSuccessMsg('');
    if (password !== confirmPassword) { 
        setError('Passwords do not match'); 
        setIsLoading(false); 
        return; 
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        // Clean up and switch to login after short delay
        setTimeout(() => {
            setPassword('');
            setConfirmPassword('');
            switchView('login');
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setIsLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal">
        <div className="auth-logo">PLAYZONE</div>

        {error && <div className="auth-error animate-fade-in"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        {successMsg && <div className="auth-error animate-fade-in" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent-success)' }}><i className="fas fa-check-circle"></i> {successMsg}</div>}

        {/* ── LOG IN / SIGN UP ── */}
        {(view === 'login' || view === 'register') && (
          <>
            <div className="auth-tagline">
              {view === 'login' ? 'Welcome back! Place your bets.' : 'Join and get 1,000 coins free!'}
            </div>
            <div className="auth-tabs">
              <button className={`auth-tab ${view === 'login' ? 'active' : ''}`} onClick={() => switchView('login')}>Login</button>
              <button className={`auth-tab ${view === 'register' ? 'active' : ''}`} onClick={() => switchView('register')}>Sign Up</button>
            </div>

            {view === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className="auth-field">
                  <label>Email</label>
                  <input type="email" className="auth-input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? "text" : "password"} className="auth-input" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}>
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginBottom: '1.25rem', marginTop: '-0.25rem' }}>
                  <button type="button" onClick={() => switchView('forgot-email')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>Forgot password?</button>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                  {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Logging in...</> : <><i className="fas fa-sign-in-alt"></i> Login</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="auth-field">
                  <label>Display Name</label>
                  <input type="text" className="auth-input" placeholder="e.g. CryptoKing" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="auth-field">
                  <label>Email</label>
                  <input type="email" className="auth-input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? "text" : "password"} className="auth-input" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}>
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="auth-field">
                  <label>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? "text" : "password"} className="auth-input" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                  </div>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                  {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Creating account...</> : <><i className="fas fa-user-plus"></i> Create Account</>}
                </button>
              </form>
            )}
          </>
        )}

        {/* ── FORGOT PWD: STEP 1 (EMAIL) ── */}
        {view === 'forgot-email' && (
          <form onSubmit={handleSendOtp} className="animate-fade-in">
            <div className="auth-tagline">We'll email you a 6-digit verification code.</div>
            <div className="auth-field">
              <label>Your Email Address</label>
              <input type="email" className="auth-input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : <><i className="fas fa-paper-plane"></i> Send Code</>}
            </button>
            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <button type="button" onClick={() => switchView('login')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                <i className="fas fa-arrow-left"></i> Back to Login
              </button>
            </div>
          </form>
        )}

        {/* ── FORGOT PWD: STEP 2 (OTP) ── */}
        {view === 'forgot-otp' && (
          <form onSubmit={handleVerifyOtp} className="animate-fade-in">
             <div className="auth-tagline">Enter the 6-digit code sent to <strong style={{color:'var(--accent-primary)'}}>{email}</strong></div>
             
             <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '2rem 0' }}>
               {otp.map((digit, i) => (
                 <input
                   key={i}
                   ref={el => otpRefs.current[i] = el}
                   type="text"
                   maxLength="1"
                   value={digit}
                   onChange={e => handleOtpChange(i, e.target.value)}
                   onKeyDown={e => handleOtpKeyDown(i, e)}
                   style={{
                     width: '45px', height: '55px', fontSize: '1.5rem', textAlign: 'center',
                     background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                     borderRadius: '8px', color: 'white', outline: 'none'
                   }}
                   autoFocus={i === 0}
                 />
               ))}
             </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading || otp.join('').length < 6}>
              {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Verifying...</> : <><i className="fas fa-check-circle"></i> Verify Code</>}
            </button>
            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.9rem' }}>
               <span style={{ color: 'var(--text-muted)' }}>Didn't receive it? </span>
               <button type="button" onClick={handleSendOtp} disabled={isLoading} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: 0 }}>
                 Resend Code
               </button>
            </div>
          </form>
        )}

        {/* ── FORGOT PWD: STEP 3 (NEW PWD) ── */}
        {view === 'forgot-reset' && (
          <form onSubmit={handleResetPassword} className="animate-fade-in">
             <div className="auth-tagline">Secure your account with a new password.</div>
             
             <div className="auth-field">
                  <label>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? "text" : "password"} className="auth-input" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoFocus style={{ paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}>
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="auth-field">
                  <label>Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? "text" : "password"} className="auth-input" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                  </div>
                </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-lock"></i> Save New Password</>}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default AuthModal;
