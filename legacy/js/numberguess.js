


document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('number-grid');
  const guessBtn = document.getElementById('guess-btn');
  const wagerInput = document.getElementById('wager-amount');
  const resultNumber = document.getElementById('result-number');
  const resultMsg = document.getElementById('result-msg');
  const particles = document.getElementById('particles');
  
  const coinMinus = document.getElementById('coin-minus');
  const coinPlus = document.getElementById('coin-plus');
  const presetBtns = document.querySelectorAll('.preset-btn');
  
  const statPlayed = document.getElementById('stat-played');
  const statWon = document.getElementById('stat-won');
  const statLost = document.getElementById('stat-lost');
  const statRate = document.getElementById('stat-rate');
  const recentList = document.getElementById('recent-list');
  
  let selectedNumber = null;
  let isPlaying = false;
  
  function updateStatsUI() {
    const stats = window.Storage ? window.Storage.get('number_stats') || { played: 0, won: 0, lost: 0 } : { played: 0, won: 0, lost: 0 };
    statPlayed.textContent = stats.played;
    statWon.textContent = stats.won;
    statLost.textContent = stats.lost;
    const rate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
    statRate.textContent = rate + '%';
    
    const recent = window.Storage ? window.Storage.get('number_recent') || [] : [];
    recentList.innerHTML = '';
    recent.forEach(r => {
      const badge = document.createElement('div');
      badge.className = `recent-badge ${r.win ? 'win' : 'loss'}`;
      badge.textContent = r.val;
      recentList.appendChild(badge);
    });
  }
  
  function saveStat(isWin, val) {
    if (!window.Storage) return;
    const stats = window.Storage.get('number_stats') || { played: 0, won: 0, lost: 0 };
    stats.played++;
    if (isWin) stats.won++; else stats.lost++;
    window.Storage.set('number_stats', stats);
    
    const recent = window.Storage.get('number_recent') || [];
    recent.unshift({ val, win: isWin });
    if (recent.length > 10) recent.pop();
    window.Storage.set('number_recent', recent);
    
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
  
  // Populate grid 1-10
  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.className = 'num-btn';
    btn.innerHTML = `<span>${i}</span>`;
    btn.dataset.num = i;
    
    btn.addEventListener('click', () => {
      if (isPlaying) return;
      document.querySelectorAll('.num-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedNumber = i;
      guessBtn.disabled = false;
    });
    
    grid.appendChild(btn);
  }
  
  guessBtn.addEventListener('click', () => {
    if (isPlaying || selectedNumber === null) return;
    
    const wager = parseInt(wagerInput.value);
    if (isNaN(wager) || wager <= 0) {
      if (window.Toast) window.Toast.show('Please enter a valid wager.', 'error');
      else alert('Invalid wager');
      return;
    }
    
    if (!window.Wallet || !window.Wallet.spend(wager)) return;
    
    isPlaying = true;
    guessBtn.disabled = true;
    guessBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Drawing...';
    
    resultNumber.textContent = '—';
    resultMsg.textContent = 'Drawing...';
    resultMsg.style.color = 'var(--text-muted)';
    resultNumber.style.color = 'var(--text-main)';
    particles.innerHTML = '';
    
    // Simulate drawing animation
    let count = 0;
    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * 10) + 1;
      document.querySelectorAll('.num-btn').forEach(b => b.classList.remove('winning'));
      const activeBtn = document.querySelector(`.num-btn[data-num="${random}"]`);
      if (activeBtn) activeBtn.classList.add('winning');
      
      if (window.GameUtils) window.GameUtils.playSound('tick');
      count++;
      
      if (count > 20) {
        clearInterval(interval);
        
        // Final result
        const winningNumber = Math.floor(Math.random() * 10) + 1;
        document.querySelectorAll('.num-btn').forEach(b => {
          b.classList.remove('winning');
          if (parseInt(b.dataset.num) === winningNumber) {
            b.classList.add('winning');
          } else {
            b.classList.add('losing');
          }
        });
        
        const isWin = selectedNumber === winningNumber;
        resultNumber.textContent = winningNumber;
        
        if (isWin) {
          const winAmount = wager * 9; // 9x multiplier
          resultMsg.textContent = `🎉 YOU WIN +${winAmount} COINS`;
          resultMsg.style.color = 'var(--accent-success)';
          resultNumber.style.color = 'var(--accent-success)';
          
          for(let i=0; i<30; i++) {
            const p = document.createElement('div');
            p.style.position = 'absolute';
            p.style.width = '8px'; p.style.height = '8px';
            p.style.background = ['#fbbf24', '#22c55e', '#22d3ee'][Math.floor(Math.random()*3)];
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
          resultMsg.textContent = `TRY AGAIN -${wager} COINS`;
          resultMsg.style.color = 'var(--accent-danger)';
          resultNumber.style.color = 'var(--accent-danger)';
        }
        
        if (window.GameUtils) window.GameUtils.processResult('Number Guess', wager, 9, isWin); // 9x multiplier
        
        saveStat(isWin, winningNumber);
        
        setTimeout(() => {
          document.querySelectorAll('.num-btn').forEach(b => b.classList.remove('losing', 'winning', 'selected'));
          selectedNumber = null;
          isPlaying = false;
          guessBtn.innerHTML = '<i class="fas fa-lock"></i> Lock In Guess';
          // guessBtn remains disabled until a new number is clicked
        }, 3000);
      }
    }, 100); // 100ms interval
    
  });
});
