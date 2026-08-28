import React, { useState, useEffect } from 'react';
import { usePlayZone } from '../context/PlayZoneContext';
import TopBar from '../components/layout/TopBar';

const Rewards = () => {
  const { balance, updateBalance } = usePlayZone();
  const [streak, setStreak] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [lastClaimed, setLastClaimed] = useState(0);

  const rewardAmount = 0.01;
  const rewards = Array(7).fill(rewardAmount); // 7 days of same reward

  useEffect(() => {
    // Load state from local storage (or mock it)
    const storedStreak = parseInt(localStorage.getItem('pz_streak')) || 0;
    const storedLastClaim = parseInt(localStorage.getItem('pz_last_claim')) || 0;
    
    setStreak(storedStreak);
    setLastClaimed(storedLastClaim);

    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    
    if (storedLastClaim === 0 || (now - storedLastClaim) > msInDay) {
      // Can claim today!
      setCanClaim(true);
      // If it's been more than 48 hours, streak is broken
      if (storedLastClaim > 0 && (now - storedLastClaim) > (2 * msInDay)) {
        setStreak(0);
        localStorage.setItem('pz_streak', 0);
      }
    } else {
      setCanClaim(false);
    }
  }, []);

  const handleClaim = () => {
    if (!canClaim) return;
    
    updateBalance(rewardAmount, 'Win', 'Daily Check-in');
    
    const newStreak = streak + 1;
    setStreak(newStreak);
    setLastClaimed(Date.now());
    setCanClaim(false);
    
    localStorage.setItem('pz_streak', newStreak);
    localStorage.setItem('pz_last_claim', Date.now());
  };

  return (
    <div>
      <TopBar hideWallet={false} />
      <div className="rewards-container">
        <div className="glass-panel animate-fade-in">
          <div className="streak-header">
            <i className="fas fa-calendar-check"></i>
            <h2>Daily Rewards</h2>
            <p className="text-muted">Check in every day to claim your ₹0.01 reward!</p>
          </div>
          
          <div className="days-grid">
            {rewards.map((amt, index) => {
              const day = index + 1;
              let statusClass = '';
              let icon = 'fa-gift';
              
              if (index < streak % 7) {
                statusClass = 'claimed';
                icon = 'fa-check-circle';
              } else if (index === streak % 7 && canClaim) {
                statusClass = 'active';
                icon = 'fa-box-open';
              }
              
              return (
                <div key={day} className={`day-card ${statusClass}`}>
                  <div className="day-title">Day {day}</div>
                  <i className={`fas ${icon}`}></i>
                  <div className="reward-amount">₹{amt}</div>
                </div>
              );
            })}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handleClaim}
              className="btn btn-primary" 
              style={{ padding: '1rem 3rem', fontSize: '1.2rem' }} 
              disabled={!canClaim}
            >
              {canClaim ? 'Claim Reward' : 'Come back tomorrow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
