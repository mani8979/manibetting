


const SEGMENTS = [
  { label: '0x', multiplier: 0 },
  { label: '1.5x', multiplier: 1.5 },
  { label: '0x', multiplier: 0 },
  { label: '2x', multiplier: 2 },
  { label: '0.5x', multiplier: 0.5 },
  { label: '3x', multiplier: 3 },
  { label: '0x', multiplier: 0 },
  { label: '10x', multiplier: 10 }
];

document.addEventListener('DOMContentLoaded', () => {
  const spinBtn = document.getElementById('spin-btn');
  const wagerInput = document.getElementById('wager-amount');
  const wheel = document.getElementById('wheel');
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
  
  let isSpinning = false;
  let currentRotation = 0;
  
  function updateStatsUI() {
    const stats = window.Storage ? window.Storage.get('wheel_stats') || { played: 0, won: 0, lost: 0 } : { played: 0, won: 0, lost: 0 };
    statPlayed.textContent = stats.played;
    statWon.textContent = stats.won;
    statLost.textContent = stats.lost;
    const rate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
    statRate.textContent = rate + '%';
    
    const recent = window.Storage ? window.Storage.get('wheel_recent') || [] : [];
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
    const stats = window.Storage.get('wheel_stats') || { played: 0, won: 0, lost: 0 };
    stats.played++;
    if (isWin) stats.won++; else stats.lost++;
    window.Storage.set('wheel_stats', stats);
    
    const recent = window.Storage.get('wheel_recent') || [];
    recent.unshift({ val, win: isWin });
    if (recent.length > 10) recent.pop();
    window.Storage.set('wheel_recent', recent);
    
    updateStatsUI();
  }
  
  updateStatsUI();
  
  // Interactions
  coinMinus.addEventListener('click', () => {
    if (isSpinning) return;
    let val = parseInt(wagerInput.value) || 0;
    val = Math.max(10, val - 10);
    wagerInput.value = val;
  });
  
  coinPlus.addEventListener('click', () => {
    if (isSpinning) return;
    let val = parseInt(wagerInput.value) || 0;
    val += 10;
    wagerInput.value = val;
  });
  
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isSpinning) return;
      wagerInput.value = btn.dataset.val;
    });
  });
  
  spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    
    const wager = parseInt(wagerInput.value);
    if (isNaN(wager) || wager <= 0) {
      if (window.Toast) window.Toast.show('Please enter a valid wager.', 'error');
      else alert('Invalid wager');
      return;
    }
    
    if (!window.Wallet || !window.Wallet.spend(wager)) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Spinning...';
    
    resultNumber.textContent = '—';
    resultMsg.textContent = 'Spinning...';
    resultMsg.style.color = 'var(--text-muted)';
    resultNumber.style.color = 'var(--text-main)';
    particles.innerHTML = '';
    
    const segmentIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segment = SEGMENTS[segmentIndex];
    
    const segmentCenterAngle = (segmentIndex * 45) + 22.5;
    const targetAngle = 360 - segmentCenterAngle;
    const spins = 5 * 360;
    const totalRotation = currentRotation + spins + targetAngle - (currentRotation % 360);
    currentRotation = totalRotation;
    
    wheel.style.setProperty('--target-rotation', `${currentRotation}deg`);
    wheel.classList.remove('animate-spin');
    void wheel.offsetWidth;
    wheel.classList.add('animate-spin');
    
    if (window.GameUtils) window.GameUtils.playSound('spin');
    
    setTimeout(() => {
      const isWin = segment.multiplier > 1;
      const winAmount = Math.floor(wager * segment.multiplier);
      
      resultNumber.textContent = segment.label;
      
      if (isWin) {
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
      } else if (segment.multiplier > 0) {
        resultMsg.textContent = `RETURNED +${winAmount} COINS`;
        resultMsg.style.color = 'var(--accent-gold)';
        resultNumber.style.color = 'var(--accent-gold)';
      } else {
        resultMsg.textContent = `TRY AGAIN -${wager} COINS`;
        resultMsg.style.color = 'var(--accent-danger)';
        resultNumber.style.color = 'var(--accent-danger)';
      }
      
      if (window.GameUtils) window.GameUtils.processResult('Lucky Wheel', wager, segment.multiplier, segment.multiplier > 0);
      
      saveStat(segment.multiplier > 0, segment.label);
      
      isSpinning = false;
      spinBtn.disabled = false;
      spinBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Spin Wheel';
    }, 4000);
  });
});
