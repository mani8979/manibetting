import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePlayZone } from '../../context/PlayZoneContext';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../../components/layout/TopBar';
import AuthModal from '../../components/auth/AuthModal';

const faceRotations = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -180 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: -90, y: 0 },
  6: { x: 90, y: 0 }
};

const Dice = () => {
  const { balance, updateBalance } = usePlayZone();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [wager, setWager] = useState(100);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [diceTransform, setDiceTransform] = useState('rotateX(15deg) rotateY(15deg)');
  const [diceClass, setDiceClass] = useState('dice-3d');
  const [stageClass, setStageClass] = useState('dice-stage');
  const [resultNumber, setResultNumber] = useState('—');
  const [resultMsg, setResultMsg] = useState('Waiting for roll...');
  const [resultMsgColor, setResultMsgColor] = useState('var(--text-muted)');
  const [particles, setParticles] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({ played: 0, won: 0, lost: 0 });
  const [recent, setRecent] = useState([]);
  
  // Track rotation state so consecutive rolls keep spinning
  const currentRotation = useRef({ x: 15, y: 15 });

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('pz_dice_stats')) || { played: 0, won: 0, lost: 0 };
    const r = JSON.parse(localStorage.getItem('pz_dice_recent')) || [];
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
    localStorage.setItem('pz_dice_stats', JSON.stringify(newStats));
    
    const newRecent = [{ val, win: isWin }, ...recent].slice(0, 10);
    setRecent(newRecent);
    localStorage.setItem('pz_dice_recent', JSON.stringify(newRecent));
  };

  const handleRoll = () => {
    if (isRolling) return;
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedPrediction) {
      alert('Please select a prediction (4, 5, or 6)');
      return;
    }
    
    if (isNaN(wager) || wager <= 0 || wager > balance) {
      alert('Invalid wager amount or insufficient funds.');
      return;
    }
    
    // Deduct immediately
    updateBalance(-wager, 'Loss', 'Dice Roll');
    
    setIsRolling(true);
    setResultNumber('—');
    setResultMsg('Rolling...');
    setResultMsgColor('var(--text-muted)');
    setParticles([]);
    
    setDiceClass('dice-3d animating-roll');
    
    const result = Math.floor(Math.random() * 6) + 1;
    const target = faceRotations[result];
    
    const spins = 4 * 360; 
    let newX = currentRotation.current.x + spins + (target.x - (currentRotation.current.x % 360));
    let newY = currentRotation.current.y + spins + (target.y - (currentRotation.current.y % 360));
    
    currentRotation.current = { x: newX, y: newY };
    
    setTimeout(() => {
      setDiceClass('dice-3d'); // remove anim
      setDiceTransform(`rotateX(${newX}deg) rotateY(${newY}deg)`);
    }, 100);
    
    setTimeout(() => {
      setStageClass('dice-stage dice-bounce');
      
      const isWin = result === selectedPrediction;
      setResultNumber(result);
      
      if (isWin) {
        setResultMsg(`🎉 YOU WIN +₹${wager * 2}`);
        setResultMsgColor('var(--accent-success)');
        updateBalance(wager * 2, 'Win', 'Dice Roll');
        
        // Gen particles
        const newParticles = Array.from({ length: 20 }).map((_, i) => ({
          id: i,
          bg: ['#fbbf24', '#22c55e', '#7c5cff'][Math.floor(Math.random()*3)],
          angle: Math.random() * Math.PI * 2,
          dist: 50 + Math.random() * 100
        }));
        setParticles(newParticles);
      } else {
        setResultMsg(`TRY AGAIN -₹${wager}`);
        setResultMsgColor('var(--accent-danger)');
      }
      
      saveStat(isWin, result);
      
      setTimeout(() => setStageClass('dice-stage'), 300);
      setIsRolling(false);
    }, 1200);
  };

  const handleWagerChange = (val) => {
    let newVal = Math.max(10, wager + val);
    setWager(newVal);
  };

  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  return (
    <div>
      <TopBar />
      <div className="game-area animate-fade-in">
        
        <div className="game-header">
          <h2>DICE ROLL</h2>
          <p>Test your luck and roll the perfect number</p>
          <div className="reward-badge" style={{ marginTop: '1rem' }}>
            <i className="fas fa-bolt"></i> WIN 2× CASH
          </div>
        </div>
        
        <div className={stageClass} id="dice-stage">
          <div className="dice-scene">
            <div className={diceClass} style={{ transform: diceTransform, transition: isRolling ? 'none' : 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              <div className="dice-face face-1"><span className="dot"></span></div>
              <div className="dice-face face-2"><span className="dot"></span><span className="dot"></span></div>
              <div className="dice-face face-3"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
              <div className="dice-face face-4"><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
              <div className="dice-face face-5"><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
              <div className="dice-face face-6"><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
            </div>
          </div>
        </div>
        
        <div className="controls-grid">
          <div className="control-group">
            <span className="control-label">Choose Your Number</span>
            <div className="prediction-options">
              {[4, 5, 6].map(val => (
                <button 
                  key={val} 
                  className={`pred-btn ${selectedPrediction === val ? 'selected' : ''}`}
                  onClick={() => !isRolling && setSelectedPrediction(val)}
                >
                  {val}
                </button>
              ))}
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
        
        <button className="main-roll-btn" onClick={handleRoll} disabled={isRolling}>
          {isRolling ? <><i className="fas fa-spinner fa-spin"></i> ROLLING...</> : <><i className="fas fa-dice"></i> Roll Dice</>}
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
          <style>{`
            @keyframes particleOut {
              0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>
          <div className="control-label" style={{ marginBottom: '0.5rem' }}>Result</div>
          <div className="result-value" style={{ color: resultNumber === '—' ? 'inherit' : resultMsgColor }}>{resultNumber}</div>
          <div className="result-msg" style={{ color: resultMsgColor }}>{resultMsg}</div>
        </div>
        
        <div className="bottom-info">
          <div className="info-card">
            <h3>Recent Results</h3>
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

export default Dice;
