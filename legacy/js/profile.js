document.addEventListener('DOMContentLoaded', () => {
  // Global Elements
  const uiUsername = document.getElementById('ui-username');
  const uiHandle = document.getElementById('ui-handle');
  const uiAvatar = document.getElementById('ui-avatar');
  const uiLevelBadge = document.getElementById('ui-level-badge');
  const uiLevelTitle = document.getElementById('ui-level-title');
  const uiXpText = document.getElementById('ui-xp-text');
  const uiXpRemain = document.getElementById('ui-xp-remain');
  const uiXpBar = document.getElementById('ui-xp-bar');
  
  const statGames = document.getElementById('ui-stat-games');
  const statWins = document.getElementById('ui-stat-wins');
  const statLosses = document.getElementById('ui-stat-losses');
  const statRate = document.getElementById('ui-stat-rate');
  
  const streakCurr = document.getElementById('ui-streak-curr');
  const streakBest = document.getElementById('ui-streak-best');
  
  const coinEarned = document.getElementById('ui-coin-earned');
  const coinSpent = document.getElementById('ui-coin-spent');
  const coinNet = document.getElementById('ui-coin-net');
  
  const favGame = document.getElementById('ui-fav-game');
  const perfList = document.getElementById('ui-perf-list');
  const recentList = document.getElementById('ui-recent');
  const achGrid = document.getElementById('ui-achievements');
  
  // Edit Modal Elements
  const editBtn = document.getElementById('edit-btn');
  const editModal = document.getElementById('edit-modal');
  const editCancel = document.getElementById('edit-cancel');
  const editSave = document.getElementById('edit-save');
  const editUsername = document.getElementById('edit-username');
  const avatarOptions = document.querySelectorAll('.avatar-option');
  
  let selectedAvatar = '🎮';
  
  // Load Profile Identity
  function loadIdentity() {
    const profile = window.Storage.get('profile_data') || { username: 'Player', avatar: '🎮' };
    uiUsername.textContent = profile.username;
    uiHandle.textContent = '@' + profile.username.toLowerCase().replace(/\s+/g, '');
    uiAvatar.textContent = profile.avatar;
    selectedAvatar = profile.avatar;
    
    // Set active in modal
    avatarOptions.forEach(opt => {
      opt.classList.remove('selected');
      if (opt.textContent === selectedAvatar) {
        opt.classList.add('selected');
      }
    });
    editUsername.value = profile.username;
  }
  
  // XP & Level Calculation
  function calculateLevel(gamesPlayed, wins) {
    const xp = (gamesPlayed * 100) + (wins * 50);
    // Level formula: Level = floor(sqrt(XP / 500)) + 1
    // L1 = 0-499, L2 = 500-1999, L3 = 2000-4499
    // Let's use a simpler linear-ish curve for visual progression
    let level = 1;
    let xpBase = 0;
    let xpNext = 500;
    
    while (xp >= xpNext) {
      level++;
      xpBase = xpNext;
      xpNext = xpBase + (level * 500);
    }
    
    const xpInLevel = xp - xpBase;
    const xpRequired = xpNext - xpBase;
    const pct = Math.min(100, Math.round((xpInLevel / xpRequired) * 100));
    
    return { level, xp, xpNext, xpInLevel, xpRequired, pct };
  }
  
  // Render Everything
  function renderDashboard() {
    const stats = window.Storage.get('stats') || { gamesPlayed: 0, wins: 0, losses: 0, highestWin: 0 };
    const history = window.Storage.get('history') || [];
    
    // 1. Identity & Level
    const lvlInfo = calculateLevel(stats.gamesPlayed, stats.wins);
    uiLevelBadge.textContent = `LEVEL ${lvlInfo.level}`;
    uiLevelTitle.textContent = `LEVEL ${lvlInfo.level}`;
    uiXpText.textContent = `${lvlInfo.xp.toLocaleString()} / ${lvlInfo.xpNext.toLocaleString()} XP`;
    uiXpRemain.textContent = `${(lvlInfo.xpNext - lvlInfo.xp).toLocaleString()} XP TO NEXT LEVEL`;
    
    setTimeout(() => {
      uiXpBar.style.width = `${lvlInfo.pct}%`;
    }, 300);
    
    // 2. Quick Stats
    statGames.textContent = stats.gamesPlayed;
    statWins.textContent = stats.wins;
    statLosses.textContent = stats.losses;
    const rate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
    statRate.textContent = rate + '%';
    
    // 3. Process History (Recent, Streaks, Coins, Performance)
    let currStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    let coinsEarned = 0;
    let coinsSpent = 0;
    
    const gameCounts = {};
    const recent5 = [];
    
    let isCurrentStreakValid = true;
    
    for (let i = 0; i < history.length; i++) {
      const h = history[i];
      if (h.result === 'Reward') continue; // skip daily rewards for streaks/performance
      
      // Recent Activity
      if (recent5.length < 5) recent5.push(h);
      
      // Coins
      if (h.result === 'Win') coinsEarned += h.amount;
      if (h.result === 'Loss') coinsSpent += h.amount;
      
      // Streaks
      if (h.result === 'Win') {
        tempStreak++;
        if (isCurrentStreakValid) currStreak++;
      } else {
        isCurrentStreakValid = false;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        tempStreak = 0;
      }
      
      // Performance
      gameCounts[h.game] = (gameCounts[h.game] || 0) + 1;
    }
    
    if (tempStreak > bestStreak) bestStreak = tempStreak;
    if (bestStreak === 0 && currStreak > 0) bestStreak = currStreak;
    
    streakCurr.textContent = `🔥 ${currStreak} WINS`;
    streakBest.textContent = `🔥 ${bestStreak} WINS`;
    
    coinEarned.textContent = `+${coinsEarned.toLocaleString()}`;
    coinSpent.textContent = `-${coinsSpent.toLocaleString()}`;
    const net = coinsEarned - coinsSpent;
    coinNet.textContent = (net >= 0 ? '+' : '') + net.toLocaleString();
    coinNet.style.color = net >= 0 ? 'var(--gold)' : 'var(--red)';
    
    // 4. Performance & Favorite Game
    perfList.innerHTML = '';
    let maxGames = 0;
    let favG = null;
    let favGCount = 0;
    
    const sortedGames = Object.entries(gameCounts).sort((a,b) => b[1] - a[1]);
    
    if (sortedGames.length > 0) {
      maxGames = sortedGames[0][1];
      favG = sortedGames[0][0];
      favGCount = sortedGames[0][1];
      
      uiFavGame.innerHTML = `
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">${favG}</div>
        <div style="color: var(--violet); font-weight: 700;">Played ${favGCount} times</div>
      `;
      
      sortedGames.forEach(([g, count]) => {
        const pct = Math.round((count / maxGames) * 100);
        let icon = 'fa-gamepad';
        if (g.includes('Dice')) icon = 'fa-dice-d6';
        if (g.includes('Wheel')) icon = 'fa-dharmachakra';
        if (g.includes('Coin')) icon = 'fa-coins';
        if (g.includes('Mines')) icon = 'fa-bomb';
        if (g.includes('Card')) icon = 'fa-layer-group';
        if (g.includes('Sports')) icon = 'fa-futbol';
        if (g.includes('Number')) icon = 'fa-hashtag';
        
        perfList.innerHTML += `
          <div class="perf-item">
            <div class="perf-name"><i class="fas ${icon}" style="color: var(--violet); width: 20px;"></i> ${g}</div>
            <div class="perf-bar-wrap">
              <div class="perf-bar-fill" style="width: ${pct}%"></div>
            </div>
            <div class="perf-count">${count}</div>
          </div>
        `;
      });
    }
    
    // 5. Recent Activity UI
    recentList.innerHTML = '';
    if (recent5.length > 0) {
      recent5.forEach(h => {
        let icon = 'fa-gamepad';
        if (h.game.includes('Dice')) icon = 'fa-dice-d6';
        if (h.game.includes('Wheel')) icon = 'fa-dharmachakra';
        if (h.game.includes('Coin')) icon = 'fa-coins';
        if (h.game.includes('Mines')) icon = 'fa-bomb';
        if (h.game.includes('Card')) icon = 'fa-layer-group';
        if (h.game.includes('Sports')) icon = 'fa-futbol';
        
        let colorClass = h.result === 'Win' ? 'positive' : (h.result === 'Loss' ? 'negative' : 'neutral');
        let prefix = h.result === 'Win' ? '+' : (h.result === 'Loss' ? '-' : '');
        
        recentList.innerHTML += `
          <div class="activity-item">
            <div class="act-left">
              <div class="act-icon"><i class="fas ${icon}"></i></div>
              <div class="act-info">
                <div class="act-game">${h.game} <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">(${h.result})</span></div>
                <div class="act-time">${h.date}</div>
              </div>
            </div>
            <div class="act-amount ${colorClass}">${prefix}${h.amount} <i class="fas fa-coins" style="color: var(--gold); font-size: 0.85em; margin-left: 0.25rem;"></i></div>
          </div>
        `;
      });
    } else {
      recentList.innerHTML = `<div class="empty-state">No recent activity. Play a game!</div>`;
    }
    
    // 6. Achievements
    const ACHIEVEMENTS = [
      { id: 'first_win', title: 'First Win', desc: 'Won a game', icon: 'fa-medal', check: () => stats.wins >= 1 },
      { id: 'games_10', title: 'Game Starter', desc: 'Played 10 games', icon: 'fa-gamepad', check: () => stats.gamesPlayed >= 10 },
      { id: 'streak_5', title: 'Win Streak', desc: 'Won 5 in a row', icon: 'fa-fire', check: () => bestStreak >= 5 },
      { id: 'lucky', title: 'Lucky Player', desc: 'Won 10 games', icon: 'fa-clover', check: () => stats.wins >= 10 },
      { id: 'dedicated', title: 'Dedicated', desc: 'Played 50 games', icon: 'fa-star', check: () => stats.gamesPlayed >= 50 },
      { id: 'master', title: 'PlayZone Master', desc: 'Played 100 games', icon: 'fa-crown', check: () => stats.gamesPlayed >= 100 }
    ];
    
    achGrid.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
      const isUnlocked = ach.check();
      achGrid.innerHTML += `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : ''}">
          ${!isUnlocked ? '<i class="fas fa-lock ach-lock"></i>' : ''}
          <i class="fas ${ach.icon} ach-icon"></i>
          <div class="ach-title">${ach.title}</div>
          <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 0.25rem;">${ach.desc}</div>
        </div>
      `;
    });
  }
  
  // Edit Modal Listeners
  editBtn.addEventListener('click', () => {
    editModal.classList.add('active');
  });
  
  editCancel.addEventListener('click', () => {
    editModal.classList.remove('active');
  });
  
  avatarOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      avatarOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedAvatar = opt.textContent;
    });
  });
  
  editSave.addEventListener('click', () => {
    const newName = editUsername.value.trim() || 'Player';
    const newProfile = { username: newName, avatar: selectedAvatar };
    window.Storage.set('profile_data', newProfile);
    
    loadIdentity();
    editModal.classList.remove('active');
  });
  
  // Init
  loadIdentity();
  renderDashboard();
});
