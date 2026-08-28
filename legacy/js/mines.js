


document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('mines-grid');
  const startBtn = document.getElementById('start-btn');
  const cashoutBtn = document.getElementById('cashout-btn');
  const wagerInput = document.getElementById('wager-amount');
  const minesCountSelect = document.getElementById('mines-count');
  
  const coinMinus = document.getElementById('coin-minus');
  const coinPlus = document.getElementById('coin-plus');
  const presetBtns = document.querySelectorAll('.preset-btn');
  
  const multiplierDisplay = document.getElementById('multiplier-display');
  const resultMsg = document.getElementById('result-msg');
  const particles = document.getElementById('particles');
  
  const statPlayed = document.getElementById('stat-played');
  const statWon = document.getElementById('stat-won');
  const statLost = document.getElementById('stat-lost');
  const statRate = document.getElementById('stat-rate');
  
  let isPlaying = false;
  let wager = 0;
  let mineCount = 3;
  let mines = [];
  let revealedCount = 0;
  let currentMultiplier = 1.0;
  
  function updateStatsUI() {
    const stats = window.Storage ? window.Storage.get('mines_stats') || { played: 0, won: 0, lost: 0 } : { played: 0, won: 0, lost: 0 };
    statPlayed.textContent = stats.played;
    statWon.textContent = stats.won;
    statLost.textContent = stats.lost;
    const rate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
    statRate.textContent = rate + '%';
  }
  
  function saveStat(isWin) {
    if (!window.Storage) return;
    const stats = window.Storage.get('mines_stats') || { played: 0, won: 0, lost: 0 };
    stats.played++;
    if (isWin) stats.won++; else stats.lost++;
    window.Storage.set('mines_stats', stats);
    updateStatsUI();
  }
  
  updateStatsUI();
  
  // Interactions
  coinMinus.addEventListener('click', () => {
    if (isPlaying) return;
    let val = parseInt(wagerInput.value) || 0;
    val = Math.max(10, val - 10);
    wagerInput.value = val;
  });
  
  coinPlus.addEventListener('click', () => {
    if (isPlaying) return;
    let val = parseInt(wagerInput.value) || 0;
    val += 10;
    wagerInput.value = val;
  });
  
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isPlaying) return;
      wagerInput.value = btn.dataset.val;
    });
  });
  
  // Initialize grid
  function initGrid() {
    grid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const tile = document.createElement('div');
      tile.className = 'mine-tile';
      tile.dataset.index = i;
      
      tile.addEventListener('click', () => {
        if (!isPlaying || tile.classList.contains('revealed')) return;
        revealTile(tile, i);
      });
      
      grid.appendChild(tile);
    }
  }
  
  initGrid();
  
  startBtn.addEventListener('click', () => {
    if (isPlaying) return;
    
    wager = parseInt(wagerInput.value);
    mineCount = parseInt(minesCountSelect.value);
    
    if (isNaN(wager) || wager <= 0) {
      if (window.Toast) window.Toast.show('Please enter a valid wager.', 'error');
      else alert('Invalid wager');
      return;
    }
    
    if (!window.Wallet || !window.Wallet.spend(wager)) return;
    
    isPlaying = true;
    startBtn.style.display = 'none';
    cashoutBtn.style.display = 'block';
    
    revealedCount = 0;
    currentMultiplier = 1.0;
    particles.innerHTML = '';
    updateUI();
    
    initGrid(); // Reset grid visual
    
    // Generate mines
    mines = [];
    while (mines.length < mineCount) {
      const r = Math.floor(Math.random() * 25);
      if (!mines.includes(r)) mines.push(r);
    }
  });
  
  cashoutBtn.addEventListener('click', () => {
    if (!isPlaying || revealedCount === 0) return; // Can't cashout before first click
    
    if (window.GameUtils) window.GameUtils.processResult('Mines', wager, currentMultiplier, true);
    endGame(true);
  });
  
  function revealTile(tile, index) {
    tile.classList.add('revealed');
    
    if (mines.includes(index)) {
      // Hit a bomb
      tile.classList.add('bomb');
      tile.innerHTML = '<i class="fas fa-bomb"></i>';
      if (window.GameUtils) window.GameUtils.playSound('explosion');
      
      if (window.GameUtils) window.GameUtils.processResult('Mines', wager, 0, false);
      endGame(false);
    } else {
      // Safe
      tile.classList.add('gem');
      tile.innerHTML = '<i class="fas fa-gem"></i>';
      if (window.GameUtils) window.GameUtils.playSound('tick');
      
      revealedCount++;
      
      // Calculate multiplier (simplified logic)
      // Base increase per gem depends on mine count
      const increase = 0.05 + (mineCount * 0.05); 
      currentMultiplier += increase;
      
      updateUI();
      
      // Auto cashout if won all safe tiles
      if (revealedCount === 25 - mineCount) {
        if (window.GameUtils) window.GameUtils.processResult('Mines', wager, currentMultiplier, true);
        endGame(true);
      }
    }
  }
  
  function updateUI() {
    multiplierDisplay.textContent = currentMultiplier.toFixed(2) + 'x';
    const winAmount = Math.floor(wager * currentMultiplier);
    
    if (isPlaying && revealedCount > 0) {
      resultMsg.textContent = `Potential Win: ${winAmount} COINS`;
      resultMsg.style.color = 'var(--text-main)';
      multiplierDisplay.style.color = 'var(--accent-secondary)';
    } else {
      resultMsg.textContent = 'Profit: 0 COINS';
      resultMsg.style.color = 'var(--text-muted)';
      multiplierDisplay.style.color = 'var(--text-muted)';
    }
  }
  
  function endGame(won) {
    isPlaying = false;
    startBtn.style.display = 'block';
    cashoutBtn.style.display = 'none';
    
    // Reveal all mines to show where they were
    document.querySelectorAll('.mine-tile').forEach((t, i) => {
      if (mines.includes(i) && !t.classList.contains('revealed')) {
        t.classList.add('revealed');
        t.style.opacity = '0.5'; // Dim ones you didn't click
        t.innerHTML = '<i class="fas fa-bomb"></i>';
      }
    });
    
    const winAmount = Math.floor(wager * currentMultiplier);
    
    if (won) {
      resultMsg.textContent = `🎉 CASHOUT: +${winAmount} COINS`;
      resultMsg.style.color = 'var(--accent-success)';
      multiplierDisplay.style.color = 'var(--accent-success)';
      
      for(let i=0; i<30; i++) {
        const p = document.createElement('div');
        p.style.position = 'absolute';
        p.style.width = '8px'; p.style.height = '8px';
        p.style.background = ['#10b981', '#34d399', '#059669'][Math.floor(Math.random()*3)];
        p.style.borderRadius = '50%';
        p.style.left = '50%'; p.style.top = '50%';
        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 150;
        p.animate([
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px)) scale(0)`, opacity: 0 }
        ], { duration: 1000, easing: 'ease-out' });
        particles.appendChild(p);
      }
    } else {
      resultMsg.textContent = `BOOM! -${wager} COINS`;
      resultMsg.style.color = 'var(--accent-danger)';
      multiplierDisplay.style.color = 'var(--accent-danger)';
    }
    
    saveStat(won);
  }
});
