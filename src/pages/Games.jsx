import React from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';

const Games = () => {
  return (
    <div>
      <TopBar />
      <h2 className="section-title"><i className="fas fa-gamepad" style={{ color: 'var(--accent-primary)' }}></i> All Games</h2>
      
      <div className="grid-cards">
        
        <Link to="/dice" className="game-card animate-fade-in" style={{ '--card-accent': 'var(--accent-primary)', animationDelay: '0.1s' }}>
          <div className="game-card-img"><i className="fas fa-dice-d6"></i></div>
          <div className="game-card-content">
            <div className="game-card-title">Dice Roll</div>
            <div className="card-stats"><span>Category: <span className="card-stat-highlight">Table</span></span> <span>Popularity: <span className="card-stat-highlight">High</span></span></div>
            <div className="game-card-desc">Roll the virtual 3D dice and win big multipliers based on your prediction!</div>
            <button className="game-card-play">Play Now</button>
          </div>
        </Link>
        
        <Link to="/coinflip" className="game-card animate-fade-in" style={{ '--card-accent': 'var(--accent-gold)', animationDelay: '0.2s' }}>
          <div className="game-card-img"><i className="fas fa-coins"></i></div>
          <div className="game-card-content">
            <div className="game-card-title">Coin Flip</div>
            <div className="card-stats"><span>Category: <span className="card-stat-highlight">Instant</span></span> <span>Popularity: <span className="card-stat-highlight">Very High</span></span></div>
            <div className="game-card-desc">Heads or Tails? Flip the 3D coin to double your cash wager.</div>
            <button className="game-card-play">Play Now</button>
          </div>
        </Link>
        
        <Link to="/numberguess" className="game-card animate-fade-in" style={{ '--card-accent': 'var(--accent-secondary)', animationDelay: '0.3s' }}>
          <div className="game-card-img"><i className="fas fa-sort-numeric-up-alt"></i></div>
          <div className="game-card-content">
            <div className="game-card-title">Number Guess</div>
            <div className="card-stats"><span>Category: <span className="card-stat-highlight">Logic</span></span> <span>Popularity: <span className="card-stat-highlight">Medium</span></span></div>
            <div className="game-card-desc">Guess a number before the grid reveals the true result.</div>
            <button className="game-card-play">Play Now</button>
          </div>
        </Link>
        
        <Link to="/cards" className="game-card animate-fade-in" style={{ '--card-accent': '#8b5cf6', animationDelay: '0.4s' }}>
          <div className="game-card-img"><i className="fas fa-layer-group"></i></div>
          <div className="game-card-content">
            <div className="game-card-title">Card Duel</div>
            <div className="card-stats"><span>Category: <span className="card-stat-highlight">Table</span></span> <span>Popularity: <span className="card-stat-highlight">High</span></span></div>
            <div className="game-card-desc">Draw a card and beat the house in this classic duel.</div>
            <button className="game-card-play">Play Now</button>
          </div>
        </Link>
        
        <Link to="/wheel" className="game-card animate-fade-in" style={{ '--card-accent': '#f59e0b', animationDelay: '0.5s' }}>
          <div className="game-card-img"><i className="fas fa-dharmachakra"></i></div>
          <div className="game-card-content">
            <div className="game-card-title">Lucky Wheel</div>
            <div className="card-stats"><span>Category: <span className="card-stat-highlight">Spin</span></span> <span>Popularity: <span className="card-stat-highlight">High</span></span></div>
            <div className="game-card-desc">Spin the fortune wheel for massive cash rewards.</div>
            <button className="game-card-play">Play Now</button>
          </div>
        </Link>
        
        <Link to="/mines" className="game-card animate-fade-in" style={{ '--card-accent': '#ef4444', animationDelay: '0.6s' }}>
          <div className="game-card-img"><i className="fas fa-bomb"></i></div>
          <div className="game-card-content">
            <div className="game-card-title">Mines</div>
            <div className="card-stats"><span>Category: <span className="card-stat-highlight">Grid</span></span> <span>Popularity: <span className="card-stat-highlight">Very High</span></span></div>
            <div className="game-card-desc">Navigate the grid to collect rewards without hitting a mine!</div>
            <button className="game-card-play">Play Now</button>
          </div>
        </Link>

        <Link to="/sports" className="game-card animate-fade-in" style={{ '--card-accent': '#10b981', animationDelay: '0.7s' }}>
          <div className="game-card-img"><i className="fas fa-futbol"></i></div>
          <div className="game-card-content">
            <div className="game-card-title">Sports Predict</div>
            <div className="card-stats"><span>Category: <span className="card-stat-highlight">Simulation</span></span> <span>Popularity: <span className="card-stat-highlight">Medium</span></span></div>
            <div className="game-card-desc">Predict the outcome of simulated matches in real-time.</div>
            <button className="game-card-play">Play Now</button>
          </div>
        </Link>
        
      </div>
    </div>
  );
};

export default Games;
