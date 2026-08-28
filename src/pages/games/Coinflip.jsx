import React, { useState, useEffect } from 'react';
import { usePlayZone } from '../../context/PlayZoneContext';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../../components/layout/TopBar';
import AuthModal from '../../components/auth/AuthModal';

const Coinflip = () => {
  const { balance, updateBalance } = usePlayZone();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [wager, setWager] = useState(100);
  const [selectedPrediction, setSelectedPrediction] = useState('heads'); // 'heads' or 'tails'
  const [isRolling, setIsRolling] = useState(false);
  
  const [coinClass, setCoinClass] = useState('coin');
  const [coinTransform, setCoinTransform] = useState('rotateY(0deg)');
  
  const [resultNumber, setResultNumber] = useState('—');
  const [resultMsg, setResultMsg] = useState('Waiting for flip...');
  const [resultMsgColor, setResultMsgColor] = useState('var(--text-muted)');
  const [particles, setParticles] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({ played: 0, won: 0, lost: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('pz_coin_stats')) || { played: 0, won: 0, lost: 0 };
    const r = JSON.parse(localStorage.getItem('pz_coin_recent')) || [];
    setStats(s);
    setRecent(r);
  }, []);

  const saveStat = (isWin, val) => {
    const newStats = {
      played: stats.played + 1,
      won: stats.won + (isWin ? 1 : 0),
      lost: stats.lost + (!isWin ? 1 : 0)
    };
    setStats(newStats);
    localStorage.setItem('pz_coin_stats', JSON.stringify(newStats));
    
    const newRecent = [{ val, win: isWin }, ...recent].slice(0, 10);
    setRecent(newRecent);
    localStorage.setItem('pz_coin_recent', JSON.stringify(newRecent));
  };

  const handleFlip = () => {
    if (isRolling) return;
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (isNaN(wager) || wager <= 0 || wager > balance) {
      alert('Invalid wager amount or insufficient funds.');
      return;
    }
    
    updateBalance(-wager, 'Loss', 'Coin Flip');
    
    setIsRolling(true);
    setResultNumber('—');
    setResultMsg('Flipping...');
    setResultMsgColor('var(--text-muted)');
    setParticles([]);
    
    setCoinClass('coin animating-flip');
    
    const isHeads = Math.random() > 0.5;
    const resultStr = isHeads ? 'heads' : 'tails';
    const targetDeg = isHeads ? 0 : 180;
    
    setTimeout(() => {
      setCoinClass('coin');
      setCoinTransform(`rotateY(${targetDeg}deg)`);
    }, 100);
    
    setTimeout(() => {
      const isWin = resultStr === selectedPrediction;
      setResultNumber(isHeads ? 'H' : 'T');
      
      if (isWin) {
        setResultMsg(`🎉 YOU WIN +₹${wager * 2}`);
        setResultMsgColor('var(--accent-success)');
        updateBalance(wager * 2, 'Win', 'Coin Flip');
        
        // Gen particles
        const newParticles = Array.from({ length: 20 }).map((_, i) => ({
          id: i,
          bg: ['#fbbf24', '#22c55e', '#f5b83d'][Math.floor(Math.random()*3)],
          angle: Math.random() * Math.PI * 2,
          dist: 50 + Math.random() * 100
        }));
        setParticles(newParticles);
      } else {
        setResultMsg(`TRY AGAIN -₹${wager}`);
        setResultMsgColor('var(--accent-danger)');
      }
      
      saveStat(isWin, isHeads ? 'H' : 'T');
      setIsRolling(false);
    }, 1500); // Wait for the 1.5s animation to finish
  };

  const handleWagerChange = (val) => {
    setWager(Math.max(10, wager + val));
  };

  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  return (
    <div>
      <TopBar />
      <div className="game-area animate-fade-in">
        
        <div className="game-header">
          <h2>COIN FLIP</h2>
          <p>Predict Heads or Tails to double your wager!</p>
          <div className="reward-badge" style={{ marginTop: '1rem', color: 'var(--accent-gold)', background: 'rgba(245, 184, 61, 0.1)', borderColor: 'rgba(245, 184, 61, 0.3)' }}>
            <i className="fas fa-rupee-sign"></i> WIN 2× CASH
          </div>
        </div>
        
        <div className="game-stage coin-stage">
          <div className="coin-container">
            <div className={coinClass} style={{ transform: coinTransform, transition: isRolling ? 'none' : 'transform 0.1s' }}>
              <div className="coin-front">H</div>
              <div className="coin-back">T</div>
            </div>
          </div>
        </div>
        
        <div className="controls-grid">
          <div className="control-group">
            <span className="control-label">Prediction</span>
            <div className="prediction-options" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <button 
                className={`pred-btn ${selectedPrediction === 'heads' ? 'selected' : ''}`}
                onClick={() => !isRolling && setSelectedPrediction('heads')}
              >
                <i className="fas fa-circle" style={{ color: '#f5b83d' }}></i> Heads
              </button>
              <button 
                className={`pred-btn ${selectedPrediction === 'tails' ? 'selected' : ''}`}
                onClick={() => !isRolling && setSelectedPrediction('tails')}
              >
                <i className="fas fa-circle" style={{ color: '#94a3b8' }}></i> Tails
              </button>
            </div>
          </div>
          
          <div className="control-group">
            <span className="control-label">Bet Amount (₹)</span>
            <div className="coin-selector-main">
              <button className="coin-btn" onClick={() => !isRolling && handleWagerChange(-10)}><i className="fas fa-minus"></i></button>
              <input 
                type="number" 
                className="coin-input" 
                value={wager} 
                onChange={(e) => setWager(parseInt(e.target.value) || 0)}
                min="10" step="10" 
                disabled={isRolling}
              />
              <button className="coin-btn" onClick={() => !isRolling && handleWagerChange(10)}><i className="fas fa-plus"></i></button>
            </div>
            <div className="coin-presets">
              {[25, 50, 100, 250, 500].map(val => (
                <button key={val} className="preset-btn" onClick={() => !isRolling && setWager(val)}>{val}</button>
              ))}
            </div>
          </div>
        </div>
        
        <button 
          className="main-action-btn" 
          style={{ background: 'linear-gradient(135deg, var(--accent-gold), #d97706)', boxShadow: '0 8px 25px rgba(245, 184, 61, 0.25)' }}
          onClick={handleFlip} 
          disabled={isRolling}
        >
          {isRolling ? <><i className="fas fa-spinner fa-spin"></i> FLIPPING...</> : <><i className="fas fa-coins"></i> Flip Coin</>}
        </button>
        
        <div className="result-container">
          <div id="particles">
            {particles.map(p => (
              <div key={p.id} style={{
                position: 'absolute',
                width: '8px', height: '8px',
                background: p.bg,
                borderRadius: '50%',
                left: '50%', top: '50%',
                transform: `translate(calc(-50% + ${Math.cos(p.angle)*p.dist}px), calc(-50% + ${Math.sin(p.angle)*p.dist}px)) scale(0)`,
                opacity: 0,
                animation: 'particleOut 1s ease-out forwards'
              }}></div>
            ))}
          </div>
          <div className="control-label" style={{ marginBottom: '0.5rem' }}>Result</div>
          <div className="result-value" style={{ color: resultNumber === '—' ? 'inherit' : resultMsgColor }}>{resultNumber}</div>
          <div className="result-msg" style={{ color: resultMsgColor }}>{resultMsg}</div>
        </div>
        
        <div className="bottom-info">
          <div className="info-card">
            <h3>Recent Flips</h3>
            <div className="recent-list">
              {recent.map((r, i) => (
                <div key={i} className={`recent-badge ${r.win ? 'win' : 'loss'}`}>{r.val}</div>
              ))}
            </div>
          </div>
          <div className="info-card">
            <h3>Game Statistics</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-val">{stats.played}</div>
                <div className="stat-lbl">Played</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{stats.won}</div>
                <div className="stat-lbl">Wins</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{stats.lost}</div>
                <div className="stat-lbl">Losses</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{winRate}%</div>
                <div className="stat-lbl">Win Rate</div>
              </div>
            </div>
          </div>
        </div>
        
        
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default Coinflip;
