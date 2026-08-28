import React, { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';

const Settings = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('pz_sound');
    if (saved !== null) {
      setSoundEnabled(saved === 'true');
    }
  }, []);

  const handleSoundToggle = (e) => {
    const checked = e.target.checked;
    setSoundEnabled(checked);
    localStorage.setItem('pz_sound', checked);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to completely reset all your data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div>
      <TopBar />
      <div className="settings-container animate-fade-in">
        <h2 className="section-title">Settings</h2>
        
        <div className="setting-group">
          <h3><i className="fas fa-sliders-h"></i> Preferences</h3>
          
          <div className="setting-item">
            <div>
              <div style={{ fontWeight: 600 }}>Sound Effects</div>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>Enable game sound effects</div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={soundEnabled} onChange={handleSoundToggle} />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        
        <div className="setting-group danger-zone" style={{ animationDelay: '0.1s' }}>
          <h3><i className="fas fa-exclamation-triangle"></i> Danger Zone</h3>
          
          <div className="setting-item">
            <div>
              <div style={{ fontWeight: 600, color: 'var(--accent-danger)' }}>Reset All Data</div>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>Permanently delete your profile, coins, and history.</div>
            </div>
            <button onClick={handleReset} className="btn btn-danger"><i className="fas fa-trash"></i> Reset Data</button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Settings;
