


const SUITS = [
  { icon: '♥', class: 'suit-red' },
  { icon: '♦', class: 'suit-red' },
  { icon: '♣', class: 'suit-black' },
  { icon: '♠', class: 'suit-black' }
];

const VALUES = [
  { label: '2', val: 2 }, { label: '3', val: 3 }, { label: '4', val: 4 },
  { label: '5', val: 5 }, { label: '6', val: 6 }, { label: '7', val: 7 },
  { label: '8', val: 8 }, { label: '9', val: 9 }, { label: '10', val: 10 },
  { label: 'J', val: 11 }, { label: 'Q', val: 12 }, { label: 'K', val: 13 },
  { label: 'A', val: 14 }
];

function getRandomCard() {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const value = VALUES[Math.floor(Math.random() * VALUES.length)];
  return { ...suit, ...value };
}

function renderCard(elementId, card) {
  const el = document.getElementById(elementId);
  el.className = `card-front ${card.class}`;
  el.innerHTML = `
    <div style="font-size: 1.5rem; position: absolute; top: 10px; left: 10px; line-height: 1;">${card.label}<br>${card.icon}</div>
    <div style="font-size: 3rem;">${card.icon}</div>
    <div style="font-size: 1.5rem; position: absolute; bottom: 10px; right: 10px; transform: rotate(180deg); line-height: 1;">${card.label}<br>${card.icon}</div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const drawBtn = document.getElementById('draw-btn');
  const wagerInput = document.getElementById('wager-amount');
  const resultNumber = document.getElementById('result-number');
  const resultMsg = document.getElementById('result-msg');
  const particles = document.getElementById('particles');
  const playerCard = document.getElementById('player-card');
  const dealerCard = document.getElementById('dealer-card');
  
  const coinMinus = document.getElementById('coin-minus');
  const coinPlus = document.getElementById('coin-plus');
  const presetBtns = document.querySelectorAll('.preset-btn');
  
  const statPlayed = document.getElementById('stat-played');
  const statWon = document.getElementById('stat-won');
  const statLost = document.getElementById('stat-lost');
  const statRate = document.getElementById('stat-rate');
  const recentList = document.getElementById('recent-list');
  
  let isPlaying = false;
  
  function updateStatsUI() {
    const stats = window.Storage ? window.Storage.get('cards_stats') || { played: 0, won: 0, lost: 0 } : { played: 0, won: 0, lost: 0 };
    statPlayed.textContent = stats.played;
    statWon.textContent = stats.won;
    statLost.textContent = stats.lost;
    const rate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
    statRate.textContent = rate + '%';
    
    const recent = window.Storage ? window.Storage.get('cards_recent') || [] : [];
    recentList.innerHTML = '';
    recent.forEach(r => {
      const badge = document.createElement('div');
      badge.className = `recent-badge ${r.res === 'win' ? 'win' : r.res === 'loss' ? 'loss' : 'push'}`;
      badge.style.background = r.res === 'push' ? 'rgba(255,255,255,0.1)' : '';
      badge.textContent = r.res.toUpperCase();
      recentList.appendChild(badge);
    });
  }
  
  function saveStat(res) {
    if (!window.Storage) return;
    const stats = window.Storage.get('cards_stats') || { played: 0, won: 0, lost: 0 };
    stats.played++;
    if (res === 'win') stats.won++; 
    else if (res === 'loss') stats.lost++;
    window.Storage.set('cards_stats', stats);
    
    const recent = window.Storage.get('cards_recent') || [];
    recent.unshift({ res });
    if (recent.length > 10) recent.pop();
    window.Storage.set('cards_recent', recent);
    
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
  
  drawBtn.addEventListener('click', () => {
    if (isPlaying) return;
    
    const wager = parseInt(wagerInput.value);
    if (isNaN(wager) || wager <= 0) {
      if (window.Toast) window.Toast.show('Please enter a valid wager.', 'error');
      else alert('Invalid wager');
      return;
    }
    
    if (!window.Wallet || !window.Wallet.spend(wager)) return;
    
    isPlaying = true;
    drawBtn.disabled = true;
    drawBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Drawing...';
    
    resultNumber.textContent = '—';
    resultMsg.textContent = 'Drawing...';
    resultMsg.style.color = 'var(--text-muted)';
    resultNumber.style.color = 'var(--text-main)';
    particles.innerHTML = '';
    
    // Reset cards
    playerCard.classList.remove('revealed');
    dealerCard.classList.remove('revealed');
    
    setTimeout(() => {
      if (window.GameUtils) window.GameUtils.playSound('flip');
      const pCard = getRandomCard();
      const dCard = getRandomCard();
      
      renderCard('player-card-content', pCard);
      renderCard('dealer-card-content', dCard);
      
      // Reveal Player
      playerCard.classList.add('revealed');
      
      setTimeout(() => {
        if (window.GameUtils) window.GameUtils.playSound('flip');
        // Reveal Dealer
        dealerCard.classList.add('revealed');
        
        setTimeout(() => {
          let resultType = 'loss';
          
          if (pCard.val > dCard.val) {
            resultType = 'win';
            const winAmount = wager * 2;
            resultMsg.textContent = `🎉 YOU WIN +${winAmount} COINS`;
            resultMsg.style.color = 'var(--accent-success)';
            resultNumber.style.color = 'var(--accent-success)';
            resultNumber.textContent = 'WIN';
            
            for(let i=0; i<30; i++) {
              const p = document.createElement('div');
              p.style.position = 'absolute';
              p.style.width = '8px'; p.style.height = '8px';
              p.style.background = ['#8b5cf6', '#a78bfa', '#c4b5fd'][Math.floor(Math.random()*3)];
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
            if (window.GameUtils) window.GameUtils.processResult('Card Duel', wager, 2, true);
          } else if (pCard.val < dCard.val) {
            resultType = 'loss';
            resultMsg.textContent = `DEALER WINS -${wager} COINS`;
            resultMsg.style.color = 'var(--accent-danger)';
            resultNumber.style.color = 'var(--accent-danger)';
            resultNumber.textContent = 'LOSS';
            if (window.GameUtils) window.GameUtils.processResult('Card Duel', wager, 0, false);
          } else {
            resultType = 'push';
            resultMsg.textContent = `TIE! WAGER REFUNDED.`;
            resultMsg.style.color = 'var(--text-main)';
            resultNumber.style.color = 'var(--text-main)';
            resultNumber.textContent = 'PUSH';
            if (window.Wallet) window.Wallet.earn(wager); // refund
            if (window.Wallet) window.Wallet.recordHistory('Card Duel', 'Push', wager);
          }
          
          saveStat(resultType);
          
          isPlaying = false;
          drawBtn.disabled = false;
          drawBtn.innerHTML = '<i class="fas fa-hand-paper"></i> Draw Cards';
        }, 500);
      }, 800); // 800ms between player and dealer reveal
    }, 300);
  });
});
