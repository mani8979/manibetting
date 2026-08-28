

const Wallet = {
  getBalance() {
    return Storage.get('balance') || 0;
  },

  setBalance(newBalance) {
    Storage.set('balance', newBalance);
    this.updateUI();
  },

  // Returns true if enough coins, false otherwise
  spend(amount) {
    const current = this.getBalance();
    if (current >= amount) {
      this.setBalance(current - amount);
      return true;
    }
    this.showInsufficientFunds();
    return false;
  },

  earn(amount) {
    const current = this.getBalance();
    this.setBalance(current + amount);
    this.animateBalanceIncrease();
  },

  recordHistory(game, result, amount, type = 'Today') {
    // result: 'Win', 'Loss', 'Reward'
    const history = Storage.get('history') || [];
    history.unshift({
      game,
      result,
      amount,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    });
    // Keep only last 50
    if (history.length > 50) history.pop();
    Storage.set('history', history);
  },

  updateUI() {
    const elements = document.querySelectorAll('.wallet-balance');
    elements.forEach(el => {
      // Animate if changing
      if (el.textContent !== this.getBalance().toLocaleString()) {
        el.classList.remove('animate-pulse');
        void el.offsetWidth; // trigger reflow
        el.classList.add('animate-pulse');
      }
      el.textContent = this.getBalance().toLocaleString();
    });
  },

  showInsufficientFunds() {
    // Assuming a global toast or modal function
    if (window.Toast) {
      window.Toast.show('Not enough virtual coins!', 'error');
    } else {
      alert('Not enough virtual coins! Claim your daily reward to get more.');
    }
  },

  animateBalanceIncrease() {
    // Trigger any global particles or coin fly effects if needed
  }
};

// Expose to window for simple components
window.Wallet = Wallet;

// Initial UI sync
document.addEventListener('DOMContentLoaded', () => {
  Wallet.updateUI();
});
