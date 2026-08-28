


const GameUtils = {
  // resultMultiplier is how much of the wager is returned on win (e.g. 2 for double)
  processResult(gameName, wager, resultMultiplier, isWin) {
    let winnings = 0;
    let resultText = 'Loss';
    
    if (isWin) {
      winnings = Math.floor(wager * resultMultiplier);
      Wallet.earn(winnings);
      resultText = 'Win';
      
      // Toast for win
      if (window.Toast) window.Toast.show(`You won ${winnings} coins!`, 'success');
    } else {
      // Wager was already deducted before playing, so just toast
      if (window.Toast) window.Toast.show(`You lost ${wager} coins. Try again!`, 'error');
    }
    
    // Update Stats
    const stats = Storage.get('stats') || { gamesPlayed: 0, wins: 0, losses: 0, highestWin: 0 };
    stats.gamesPlayed += 1;
    if (isWin) {
      stats.wins += 1;
      if (winnings > stats.highestWin) {
        stats.highestWin = winnings;
      }
    } else {
      stats.losses += 1;
    }
    Storage.set('stats', stats);
    
    // Update History (amount logged is net change for history display, or just raw won/lost)
    // For simplicity, we log the amount won if win, and amount wagered if lost.
    Wallet.recordHistory(gameName, resultText, isWin ? winnings : wager);
  },
  
  // Check if sound is enabled and play
  playSound(type) {
    const soundEnabled = Storage.get('soundEnabled');
    if (soundEnabled === false) return;
    
    // Here we would play an Audio object. 
    // Since we don't have actual sound files, we just stub it out.
    // console.log('Playing sound:', type);
  }
};

window.GameUtils = GameUtils;
