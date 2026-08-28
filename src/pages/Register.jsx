import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    const result = await register(name, email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="game-area animate-fade-in" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Create Account</h2>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-darker)', border: '1px solid var(--border-glass)', color: 'var(--text-main)' }}
              placeholder="e.g. CryptoKing"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-darker)', border: '1px solid var(--border-glass)', color: 'var(--text-main)' }}
              placeholder="Enter your email"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-darker)', border: '1px solid var(--border-glass)', color: 'var(--text-main)' }}
              placeholder="Create a password"
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Confirm Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-darker)', border: '1px solid var(--border-glass)', color: 'var(--text-main)' }}
              placeholder="Confirm your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            disabled={isLoading}
          >
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Sign Up'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
