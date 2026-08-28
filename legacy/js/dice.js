document.addEventListener('DOMContentLoaded', () => {
  const rollBtn = document.getElementById('roll-btn');
  const wagerInput = document.getElementById('wager-amount');
  const dice3d = document.getElementById('dice-3d');
  const resultContainer = document.getElementById('result-container');
  const resultNumber = document.getElementById('result-number');
  const resultMsg = document.getElementById('result-msg');
  const particles = document.getElementById('particles');
  
  // Controls
  const predBtns = document.querySelectorAll('.pred-btn');
  const coinMinus = document.getElementById('coin-minus');
  const coinPlus = document.getElementById('coin-plus');
  const presetBtns = document.querySelectorAll('.preset-btn');
  
  // Stats
  const statPlayed = document.getElementById('stat-played');
  const statWon = document.getElementById('stat-won');
  const statLost = document.getElementById('stat-lost');
  const statRate = document.getElementById('stat-rate');
  const recentList = document.getElementById('recent-list');
  
  let isRolling = false;
  let currentX = 15;
  let currentY = 15;
  let selectedPrediction = null;
  
  // Base rotations for each face
  const faceRotations = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: -180 },
    3: { x: 0, y: -90 },
    4: { x: 0, y: 90 },
    5: { x: -90, y: 0 },
    6: { x: 90, y: 0 }
  };
  
  // Load Stats
  function updateStatsUI() {
    const stats = window.Storage ? window.Storage.get('dice_stats') || { played: 0, won: 0, lost: 0 } : { played: 0, won: 0, lost: 0 };
    statPlayed.textContent = stats.played;
    statWon.textContent = stats.won;
    statLost.textContent = stats.lost;
    const rate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
    statRate.textContent = rate + '%';
    
    // Recent
    const recent = window.Storage ? window.Storage.get('dice_recent') || [] : [];
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
    const stats = window.Storage.get('dice_stats') || { played: 0, won: 0, lost: 0 };
    stats.played++;
    if (isWin) stats.won++; else stats.lost++;
    window.Storage.set('dice_stats', stats);
    
    const recent = window.Storage.get('dice_recent') || [];
    recent.unshift({ val, win: isWin });
    if (recent.length > 10) recent.pop();
    window.Storage.set('dice_recent', recent);
    
    updateStatsUI();
  }
  
  updateStatsUI();
  
  // UI Interactions
  predBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRolling) return;
      predBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPrediction = parseInt(btn.dataset.val);
    });
  });
  
  coinMinus.addEventListener('click', () => {
    if (isRolling) return;
    let val = parseInt(wagerInput.value) || 0;
    val = Math.max(10, val - 10);
    wagerInput.value = val;
  });
  
  coinPlus.addEventListener('click', () => {
    if (isRolling) return;
    let val = parseInt(wagerInput.value) || 0;
    val += 10;
    wagerInput.value = val;
  });
  
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRolling) return;
      wagerInput.value = btn.dataset.val;
    });
  });
  
  rollBtn.addEventListener('click', () => {
    if (isRolling) return;
    
    if (!selectedPrediction) {
      if (window.Toast) window.Toast.show('Please select a prediction (4, 5, or 6)', 'error');
      else alert('Please select a prediction (4, 5, or 6)');
      return;
    }
    
    const wager = parseInt(wagerInput.value);
    if (isNaN(wager) || wager <= 0) {
      if (window.Toast) window.Toast.show('Please enter a valid virtual coin amount.', 'error');
      return;
    }
    
    if (!window.Wallet || !window.Wallet.spend(wager)) return; 
    
    isRolling = true;
    rollBtn.disabled = true;
    rollBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ROLLING...';
    
    resultNumber.textContent = '—';
    resultMsg.textContent = 'Rolling...';
    resultMsg.style.color = 'var(--text-muted)';
    particles.innerHTML = '';
    
    if (window.GameUtils) window.GameUtils.playSound('roll');
    
    // Animate Dice
    dice3d.classList.add('animating-roll');
    
    const result = Math.floor(Math.random() * 6) + 1;
    const target = faceRotations[result];
    
    const spins = 4 * 360; 
    currentX = currentX + spins + (target.x - (currentX % 360));
    currentY = currentY + spins + (target.y - (currentY % 360));
    
    // Apply transform after a small delay to let CSS animation class take over, then override
    setTimeout(() => {
      dice3d.classList.remove('animating-roll');
      dice3d.style.transition = 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      dice3d.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg)`;
    }, 100);
    
    // Wait for roll
    setTimeout(() => {
      dice3d.parentElement.classList.add('dice-bounce');
      
      const isWin = result === selectedPrediction;
      resultNumber.textContent = result;
      
      if (isWin) {
        resultMsg.textContent = `🎉 YOU WIN +${wager * 2} COINS`;
        resultMsg.style.color = 'var(--accent-success)';
        resultNumber.style.color = 'var(--accent-success)';
        
        // Confetti
        for(let i=0; i<20; i++) {
          const p = document.createElement('div');
          p.style.position = 'absolute';
          p.style.width = '8px'; p.style.height = '8px';
          p.style.background = ['#fbbf24', '#22c55e', '#7c5cff'][Math.floor(Math.random()*3)];
          p.style.borderRadius = '50%';
          p.style.left = '50%'; p.style.top = '50%';
          const angle = Math.random() * Math.PI * 2;
          const dist = 50 + Math.random() * 100;
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
      
      if (window.GameUtils) window.GameUtils.processResult('Dice Roll', wager, 2, isWin);
      
      saveStat(isWin, result);
      
      setTimeout(() => dice3d.parentElement.classList.remove('dice-bounce'), 300);
      
      isRolling = false;
      rollBtn.disabled = false;
      rollBtn.innerHTML = '<i class="fas fa-dice"></i> Roll Dice';
    }, 1200); 
  });
});
