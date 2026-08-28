import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        // Auto-redirect to home after 3s
        setTimeout(() => navigate('/'), 3000);
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch {
      setStatus('error');
      setMessage('Server error. Please try again.');
    }
  };

  const strengthScore = () => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = strengthScore();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#84cc16', '#22c55e', '#0ea5e9'][strength];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg-dark)'
    }}>
      <div className="auth-modal" style={{ maxWidth: '420px', width: '100%' }}>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: 'var(--accent-success)', marginBottom: '0.5rem' }}>Password Reset!</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Your password has been updated. Redirecting you to the app in a moment...
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 2rem', display: 'inline-block' }}>
                <i className="fas fa-home"></i> Go to PlayZone
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-logo">PLAYZONE</div>
            <div className="auth-tagline">Set your new password below.</div>

            {status === 'error' && (
              <div className="auth-error">
                <i className="fas fa-exclamation-circle"></i> {message}
                {message.includes('expired') && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    <Link to="/" style={{ color: 'var(--accent-primary)' }}>Go back and request a new link</Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>

                {/* Password strength meter */}
                {password.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '3px', borderRadius: '2px',
                          background: i <= strength ? strengthColor : 'rgba(255,255,255,0.1)',
                          transition: 'background 0.3s'
                        }}></div>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: strengthColor }}>{strengthLabel}</span>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label>Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    borderColor: confirmPassword.length > 0
                      ? confirmPassword === password ? 'var(--accent-success)' : 'var(--accent-danger)'
                      : undefined
                  }}
                />
                {confirmPassword.length > 0 && (
                  <div style={{ fontSize: '0.78rem', marginTop: '0.3rem', color: confirmPassword === password ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={status === 'loading' || password !== confirmPassword || password.length < 6}
              >
                {status === 'loading'
                  ? <><i className="fas fa-spinner fa-spin"></i> Resetting...</>
                  : <><i className="fas fa-lock"></i> Set New Password</>
                }
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
