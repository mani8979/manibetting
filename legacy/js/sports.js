  const MATCHES = [
  { id: 1, team1: 'Manchester City', team2: 'Arsenal', odds: { t1: 1.8, draw: 3.2, t2: 4.5 } },
  { id: 2, team1: 'Real Madrid', team2: 'Barcelona', odds: { t1: 2.1, draw: 3.0, t2: 3.5 } },
  { id: 3, team1: 'Bayern Munich', team2: 'Dortmund', odds: { t1: 1.5, draw: 4.0, t2: 6.0 } },
  { id: 4, team1: 'Mumbai Indians', team2: 'CSK', odds: { t1: 1.9, draw: null, t2: 1.9 } }, // Cricket, no draw usually
  { id: 5, team1: 'Lakers', team2: 'Warriors', odds: { t1: 2.2, draw: null, t2: 1.7 } } // Basketball
];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('matches-container');
  if (!container) return;
  
  const modal = document.getElementById('sim-modal');
  const simTitle = document.getElementById('sim-title');
  const simDesc = document.getElementById('sim-desc');
  const simResult = document.getElementById('sim-result');
  const simClose = document.getElementById('sim-close');
  const simParticles = document.getElementById('sim-particles');
  
  const statPlayed = document.getElementById('stat-played');
  const statWon = document.getElementById('stat-won');
  const statLost = document.getElementById('stat-lost');
  const statRate = document.getElementById('stat-rate');
  
  let isSimulating = false;
  
  function updateStatsUI() {
    const stats = window.Storage ? window.Storage.get('sports_stats') || { played: 0, won: 0, lost: 0 } : { played: 0, won: 0, lost: 0 };
    if (statPlayed) statPlayed.textContent = stats.played;
    if (statWon) statWon.textContent = stats.won;
    if (statLost) statLost.textContent = stats.lost;
    const rate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
    if (statRate) statRate.textContent = rate + '%';
  }
  
  function saveStat(isWin) {
    if (!window.Storage) return;
    const stats = window.Storage.get('sports_stats') || { played: 0, won: 0, lost: 0 };
    stats.played++;
    if (isWin) stats.won++; else stats.lost++;
    window.Storage.set('sports_stats', stats);
    updateStatsUI();
  }
  
  updateStatsUI();
  
  // Render Matches
  MATCHES.forEach(match => {
    const card = document.createElement('div');
    card.className = 'match-card animate-fade-in';
    
    // Check if draw exists
    const drawHtml = match.odds.draw ? `
      <div class="odd-btn" data-match="${match.id}" data-choice="draw" data-odds="${match.odds.draw}">
        <span class="odd-label">Draw</span>
        <span class="odd-value">${match.odds.draw}x</span>
      </div>
    ` : '<div></div>'; // empty space
    
    card.innerHTML = `
      <div class="match-header">
        <span><i class="fas fa-clock"></i> Virtual Match</span>
        <span>ID: SIM-${match.id}</span>
      </div>
      
      <div class="teams-container">
        <div class="team">
          <div class="team-logo"><i class="fas fa-shield-alt"></i></div>
          <div class="team-name">${match.team1}</div>
        </div>
        <div class="vs">VS</div>
        <div class="team">
          <div class="team-logo"><i class="fas fa-shield-alt"></i></div>
          <div class="team-name">${match.team2}</div>
        </div>
      </div>
      
      <div class="odds-container" id="odds-${match.id}">
        <div class="odd-btn" data-match="${match.id}" data-choice="t1" data-odds="${match.odds.t1}">
          <span class="odd-label">${match.team1} Win</span>
          <span class="odd-value">${match.odds.t1}x</span>
        </div>
        ${drawHtml}
        <div class="odd-btn" data-match="${match.id}" data-choice="t2" data-odds="${match.odds.t2}">
          <span class="odd-label">${match.team2} Win</span>
          <span class="odd-value">${match.odds.t2}x</span>
        </div>
      </div>
      
      <div class="action-area" id="action-${match.id}">
        <div class="coin-selector-main" style="margin-right: auto; max-width: 250px;">
          <button class="coin-btn w-minus" data-match="${match.id}"><i class="fas fa-minus"></i></button>
          <input type="number" id="wager-${match.id}" class="coin-input" value="100" min="10" step="10">
          <button class="coin-btn w-plus" data-match="${match.id}"><i class="fas fa-plus"></i></button>
        </div>
        <button class="main-action-btn place-bet-btn" data-match="${match.id}" style="width: auto;"><i class="fas fa-play"></i> Simulate Match</button>
      </div>
    `;
    
    container.appendChild(card);
    
    // Add event listeners for odds selection
    const oddBtns = card.querySelectorAll(`.odd-btn[data-match="${match.id}"]`);
    const actionArea = card.querySelector(`#action-${match.id}`);
    
    let selectedChoice = null;
    let selectedOdds = null;
    
    oddBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (isSimulating) return;
        oddBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        selectedChoice = btn.dataset.choice;
        selectedOdds = parseFloat(btn.dataset.odds);
        actionArea.style.display = 'flex';
      });
    });
    
    // Simulate button
    const placeBtn = card.querySelector(`.place-bet-btn[data-match="${match.id}"]`);
    const wagerInput = card.querySelector(`#wager-${match.id}`);
    const wMinus = card.querySelector(`.w-minus[data-match="${match.id}"]`);
    const wPlus = card.querySelector(`.w-plus[data-match="${match.id}"]`);
    
    wMinus.addEventListener('click', () => {
      if (isSimulating) return;
      let val = parseInt(wagerInput.value) || 0;
      wagerInput.value = Math.max(10, val - 10);
    });
    
    wPlus.addEventListener('click', () => {
      if (isSimulating) return;
      let val = parseInt(wagerInput.value) || 0;
      wagerInput.value = val + 10;
    });
    
    placeBtn.addEventListener('click', () => {
      if (isSimulating || !selectedChoice) return;
      
      const wager = parseInt(wagerInput.value);
      if (isNaN(wager) || wager <= 0) {
        if (window.Toast) window.Toast.show('Please enter a valid wager.', 'error');
        return;
      }
      
      if (!window.Wallet || !window.Wallet.spend(wager)) return;
      
      isSimulating = true;
      modal.classList.add('active');
      simTitle.textContent = 'Simulating Match...';
      simDesc.style.display = 'block';
      simResult.style.display = 'none';
      simClose.style.display = 'none';
      if(simParticles) simParticles.innerHTML = '';
      
      // The simulation result
      setTimeout(() => {
        // Simple random logic based roughly on odds
        // If odds are lower, chance is higher.
        // E.g., prob = 1 / odds. Sum of probs > 1 because of house edge.
        const p1 = 1 / match.odds.t1;
        const pDraw = match.odds.draw ? (1 / match.odds.draw) : 0;
        const p2 = 1 / match.odds.t2;
        const totalP = p1 + pDraw + p2;
        
        const rand = Math.random() * totalP;
        
        let matchResult = '';
        if (rand < p1) matchResult = 't1';
        else if (rand < p1 + pDraw) matchResult = 'draw';
        else matchResult = 't2';
        
        let resultString = '';
        if (matchResult === 't1') resultString = `${match.team1} Wins!`;
        if (matchResult === 't2') resultString = `${match.team2} Wins!`;
        if (matchResult === 'draw') resultString = 'Match Drawn!';
        
        simDesc.style.display = 'none';
        simResult.style.display = 'block';
        simResult.textContent = resultString;
        
        const isWin = selectedChoice === matchResult;
        if (isWin) {
          const winAmount = Math.floor(wager * selectedOdds);
          simResult.style.color = 'var(--accent-success)';
          simResult.innerHTML += `<div style="font-size: 1.2rem; margin-top: 1rem; color: var(--text-main);">Prediction Correct! You won ${winAmount} COINS</div>`;
          
          if (simParticles) {
            for(let i=0; i<40; i++) {
              const p = document.createElement('div');
              p.style.position = 'absolute';
              p.style.width = '10px'; p.style.height = '10px';
              p.style.background = ['#10b981', '#34d399', '#f59e0b'][Math.floor(Math.random()*3)];
              p.style.borderRadius = '50%';
              p.style.left = '50%'; p.style.top = '50%';
              const angle = Math.random() * Math.PI * 2;
              const dist = 50 + Math.random() * 250;
              p.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px)) scale(0)`, opacity: 0 }
              ], { duration: 1500, easing: 'ease-out' });
              simParticles.appendChild(p);
            }
          }
        } else {
          simResult.style.color = 'var(--accent-danger)';
          simResult.innerHTML += `<div style="font-size: 1.2rem; margin-top: 1rem; color: var(--text-main);">Prediction Failed.</div>`;
        }
        
        if (window.GameUtils) window.GameUtils.processResult('Sports Simulator', wager, selectedOdds, isWin);
        saveStat(isWin);
        
        simClose.style.display = 'block';
      }, 2500);
    });
  });
  
  simClose.addEventListener('click', () => {
    modal.classList.remove('active');
    isSimulating = false;
    // reset UI selections
    document.querySelectorAll('.odd-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.action-area').forEach(a => a.style.display = 'none');
  });
});
