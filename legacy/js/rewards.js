


const REWARD_AMOUNTS = [100, 150, 200, 300, 500, 750, 1000];
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('rewards-grid');
  const claimBtn = document.getElementById('claim-btn');
  
  if (!grid || !claimBtn) return;
  
  let rewardData = Storage.get('dailyReward') || {
    streak: 0,
    lastClaimed: 0
  };
  
  const now = Date.now();
  const timeSinceLastClaim = now - rewardData.lastClaimed;
  
  // If more than 48 hours have passed, reset streak
  if (rewardData.lastClaimed !== 0 && timeSinceLastClaim > ONE_DAY_MS * 2) {
    rewardData.streak = 0;
  }
  
  const canClaim = timeSinceLastClaim >= ONE_DAY_MS || rewardData.lastClaimed === 0;
  
  // Render grid
  REWARD_AMOUNTS.forEach((amount, index) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    
    // Determine state
    if (index < rewardData.streak) {
      card.classList.add('claimed');
      card.innerHTML = `
        <i class="fas fa-check-circle" style="color: var(--accent-success);"></i>
        <div class="day-title">Day ${index + 1}</div>
        <div class="reward-amount">${amount}</div>
      `;
    } else if (index === rewardData.streak) {
      if (canClaim) {
        card.classList.add('active');
        card.innerHTML = `
          <i class="fas fa-gift animate-pulse"></i>
          <div class="day-title">Day ${index + 1}</div>
          <div class="reward-amount">${amount}</div>
        `;
      } else {
        card.innerHTML = `
          <i class="fas fa-lock"></i>
          <div class="day-title">Day ${index + 1}</div>
          <div class="reward-amount">${amount}</div>
        `;
      }
    } else {
      card.innerHTML = `
        <i class="fas fa-lock"></i>
        <div class="day-title">Day ${index + 1}</div>
        <div class="reward-amount">${amount}</div>
      `;
    }
    
    grid.appendChild(card);
  });
  
  // Setup button
  if (canClaim) {
    claimBtn.disabled = false;
    claimBtn.textContent = `Claim ${REWARD_AMOUNTS[rewardData.streak]} Coins`;
    
    claimBtn.addEventListener('click', () => {
      const amount = REWARD_AMOUNTS[rewardData.streak];
      Wallet.earn(amount);
      Wallet.recordHistory('Daily Reward', 'Reward', amount);
      
      rewardData.streak = (rewardData.streak + 1) % REWARD_AMOUNTS.length;
      rewardData.lastClaimed = Date.now();
      Storage.set('dailyReward', rewardData);
      
      window.Toast.show(`Successfully claimed ${amount} coins!`, 'success');
      
      // Update UI
      claimBtn.disabled = true;
      claimBtn.textContent = 'Come back tomorrow!';
      setTimeout(() => window.location.reload(), 1500);
    });
  } else {
    const nextClaimTime = new Date(rewardData.lastClaimed + ONE_DAY_MS);
    claimBtn.textContent = `Next reward at ${nextClaimTime.toLocaleTimeString()}`;
  }
});
