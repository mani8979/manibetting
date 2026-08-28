

const DUMMY_PLAYERS = [
  { name: 'Alex', avatar: 'fa-user-ninja', games: 420 },
  { name: 'Rahul', avatar: 'fa-user-tie', games: 315 },
  { name: 'John', avatar: 'fa-user-secret', games: 280 },
  { name: 'Sarah', avatar: 'fa-user-astronaut', games: 250 },
  { name: 'Mike', avatar: 'fa-user-graduate', games: 190 }
];

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('leaderboard-list');
  if (!list) return;

  const currentBalance = Storage.get('balance') || 0;
  const currentStats = Storage.get('stats') || { gamesPlayed: 0 };
  
  const players = DUMMY_PLAYERS.map((p, index) => {
    // Generate static but realistic looking balances based on their rank
    const dummyBalance = 52400 - (index * 4200) - (Math.floor(Math.random() * 1000));
    return {
      ...p,
      balance: dummyBalance,
      isCurrentUser: false
    };
  });
  
  players.push({
    name: 'You',
    avatar: 'fa-user',
    games: currentStats.gamesPlayed,
    balance: currentBalance,
    isCurrentUser: true
  });
  
  // Sort descending
  players.sort((a, b) => b.balance - a.balance);
  
  // Render
  players.forEach((p, index) => {
    const rank = index + 1;
    const row = document.createElement('div');
    row.className = `leader-row animate-fade-in ${p.isCurrentUser ? 'current-user' : ''}`;
    row.style.animationDelay = `${index * 0.1}s`;
    
    let rankClass = '';
    if (rank === 1) rankClass = 'rank-1';
    else if (rank === 2) rankClass = 'rank-2';
    else if (rank === 3) rankClass = 'rank-3';
    
    row.innerHTML = `
      <div class="leader-rank ${rankClass}">#${rank}</div>
      <div class="leader-avatar">
        <i class="fas ${p.avatar}"></i>
      </div>
      <div class="leader-info">
        <div class="leader-name">${p.name}</div>
        <div class="leader-stats">${p.games} Games Played</div>
      </div>
      <div class="leader-coins">
        ${p.balance.toLocaleString()} 🪙
      </div>
    `;
    
    list.appendChild(row);
  });
});
