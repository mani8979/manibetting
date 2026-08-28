import React, { useState, useEffect } from 'react';
import { usePlayZone } from '../context/PlayZoneContext';
import TopBar from '../components/layout/TopBar';

const Leaderboard = () => {
  const { balance } = usePlayZone();
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    // Mock leaders just like legacy
    const mockLeaders = [
      { name: 'CryptoKing', cash: 15420, avatar: '👑', isUser: false },
      { name: 'DiamondHands', cash: 8905, avatar: '💎', isUser: false },
      { name: 'LuckyRoller', cash: 4502, avatar: '🎲', isUser: false },
      { name: 'Player', cash: balance, avatar: '🎮', isUser: true }, // Inject current user
      { name: 'RiskTaker', cash: 1250, avatar: '🔥', isUser: false },
      { name: 'SteadyEarner', cash: 850, avatar: '📈', isUser: false },
      { name: 'NewBettor', cash: 150, avatar: '🔰', isUser: false },
    ];

    // Sort by cash
    mockLeaders.sort((a, b) => b.cash - a.cash);
    setLeaders(mockLeaders);
  }, [balance]);

  return (
    <div>
      <TopBar />
      <div className="leaderboard-container animate-fade-in">
        <h2 className="section-title"><i className="fas fa-trophy" style={{ color: '#fbbf24' }}></i> Top Players</h2>
        <div className="leaderboard-list">
          {leaders.map((leader, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            
            return (
              <div key={leader.name} className={`leader-row ${leader.isUser ? 'current-user' : ''}`}>
                <div className={`leader-rank ${rankClass}`}>#{rank}</div>
                <div className="leader-avatar">{leader.avatar}</div>
                <div className="leader-info">
                  <div className="leader-name">{leader.name} {leader.isUser && '(You)'}</div>
                  <div className="leader-stats">Level {Math.floor(leader.cash / 1000) + 1}</div>
                </div>
                <div className="leader-coins">
                  ₹{leader.cash.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
