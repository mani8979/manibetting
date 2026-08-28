


document.addEventListener('DOMContentLoaded', () => {
  const flipBtn = document.getElementById('flip-btn');
  const wagerInput = document.getElementById('wager-amount');
  const coin = document.getElementById('coin');
  const resultNumber = document.getElementById('result-number');
  const resultMsg = document.getElementById('result-msg');
  const particles = document.getElementById('particles');
  const predBtns = document.querySelectorAll('.pred-btn');
  
  const coinMinus = document.getElementById('coin-minus');
  const coinPlus = document.getElementById('coin-plus');
  const presetBtns = document.querySelectorAll('.preset-btn');
  
  const statPlayed = document.getElementById('stat-played');
  const statWon = document.getElementById('stat-won');
  const statLost = document.getElementById('stat-lost');
  const statRate = document.getElementById('stat-rate');
  const recentList = document.getElementById('recent-list');
  
  let selectedChoice = 'heads';
  let isFlipping = false;
  
  function updateStatsUI() {
    const stats = window.Storage ? window.Storage.get('coin_stats') || { played: 0, won: 0, lost: 0 } : { played: 0, won: 0, lost: 0 };
    statPlayed.textContent = stats.played;
    statWon.textContent = stats.won;
    statLost.textContent = stats.lost;
    const rate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
    statRate.textContent = rate + '%';
    
    const recent = window.Storage ? window.Storage.get('coin_recent') || [] : [];
    recentList.innerHTML = '';
    recent.forEach(r => {
      const badge = document.createElement('div');
      badge.className = `recent-badge ${r.win ? 'win' : 'loss'}`;
      badge.textContent = r.val.toUpperCase();
      recentList.appendChild(badge);
    });
  }
  
  function saveStat(isWin, val) {
    if (!window.Storage) return;
    const stats = window.Storage.get('coin_stats') || { played: 0, won: 0, lost: 0 };
    stats.played++;
    if (isWin) stats.won++; else stats.lost++;
    window.Storage.set('coin_stats', stats);
    
    const recent = window.Storage.get('coin_recent') || [];
    recent.unshift({ val, win: isWin });
    if (recent.length > 10) recent.pop();
    window.Storage.set('coin_recent', recent);
    
    updateStatsUI();
  }
  
  updateStatsUI();
  
  // Interactions
  coinMinus.addEventListener('click', () => {
    if (isFlipping) return;
    let val = parseInt(wagerInput.value) || 0;
    val = Math.max(10, val - 10);
    wagerInput.value = val;
  });
  
  coinPlus.addEventListener('click', () => {
    if (isFlipping) return;
    let val = parseInt(wagerInput.value) || 0;
    val += 10;
    wagerInput.value = val;
  });
  
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isFlipping) return;
      wagerInput.value = btn.dataset.val;
    });
  });
  
  predBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isFlipping) return;
      predBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedChoice = btn.dataset.choice;
    });
  });
  
  flipBtn.addEventListener('click', () => {
    if (isFlipping) return;
    
    const wager = parseInt(wagerInput.value);
    if (isNaN(wager) || wager <= 0) {
      if (window.Toast) window.Toast.show('Please enter a valid wager.', 'error');
      else alert('Invalid wager');
      return;
    }
    
    if (!window.Wallet || !window.Wallet.spend(wager)) return;
    
    isFlipping = true;
    flipBtn.disabled = true;
    flipBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Flipping...';
    
    resultNumber.textContent = '—';
    resultMsg.textContent = 'Flipping...';
    resultMsg.style.color = 'var(--text-muted)';
    resultNumber.style.color = 'var(--text-main)';
    particles.innerHTML = '';
    
    // Reset animation
    coin.classList.remove('animating-flip');
    void coin.offsetWidth;
    coin.classList.add('animating-flip');
    
    if (window.GameUtils) window.GameUtils.playSound('flip');
    
    setTimeout(() => {
      const isHeadsResult = Math.random() < 0.5;
      const resultString = isHeadsResult ? 'heads' : 'tails';
      
      coin.classList.remove('animating-flip');
      coin.style.transform = isHeadsResult ? 'rotateY(0deg)' : 'rotateY(180deg)';
      
      const isWin = selectedChoice === resultString;
      
      resultNumber.textContent = resultString.toUpperCase();
      
      if (isWin) {
        const winAmount = wager * 2;
        resultMsg.textContent = `🎉 YOU WIN +${winAmount} COINS`;
        resultMsg.style.color = 'var(--accent-success)';
        resultNumber.style.color = 'var(--accent-success)';
        
        for(let i=0; i<30; i++) {
          const p = document.createElement('div');
          p.style.position = 'absolute';
          p.style.width = '8px'; p.style.height = '8px';
          p.style.background = ['#fbbf24', '#22c55e', '#7c5cff'][Math.floor(Math.random()*3)];
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
      
      if (window.GameUtils) window.GameUtils.processResult('Coin Flip', wager, 2, isWin);
      
      saveStat(isWin, resultString);
      
      isFlipping = false;
      flipBtn.disabled = false;
      flipBtn.innerHTML = '<i class="fas fa-coins"></i> Flip Coin';
    }, 1500); // 1.5s from CSS animation
  });
});
