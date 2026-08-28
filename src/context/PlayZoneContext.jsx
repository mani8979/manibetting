import React, { createContext, useContext, useState, useEffect } from 'react';

const PlayZoneContext = createContext();

const STORAGE_PREFIX = 'playzone_';

const getStorage = (key, defaultValue) => {
  const data = localStorage.getItem(STORAGE_PREFIX + key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

const setStorage = (key, value) => {
  const val = typeof value === 'object' ? JSON.stringify(value) : value;
  localStorage.setItem(STORAGE_PREFIX + key, val);
};

const clearStorage = () => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
  keys.forEach(k => localStorage.removeItem(k));
};

export const PlayZoneProvider = ({ children }) => {
  // Balance starts at 0, not 10000 — only gets 10000 if logged in via backend
  const [balance, setBalance] = useState(() => getStorage('balance', 0));
  const [history, setHistory] = useState(() => getStorage('history', []));
  const [stats, setStats] = useState(() => getStorage('stats', {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    highestWin: 0
  }));

  // User Profile — no dummy data
  const [userProfile, setUserProfile] = useState(() => getStorage('profile', {
    avatar: '🎮',
    username: '',
    handle: '',
    level: 1,
    xp: 0
  }));
  
  // Streaks
  const [streaks, setStreaks] = useState(() => getStorage('streaks', {
    current: 0,
    best: 0
  }));

  useEffect(() => { setStorage('balance', balance); }, [balance]);
  useEffect(() => { setStorage('history', history); }, [history]);
  useEffect(() => { setStorage('stats', stats); }, [stats]);
  useEffect(() => { setStorage('profile', userProfile); }, [userProfile]);
  useEffect(() => { setStorage('streaks', streaks); }, [streaks]);

  // Called when user logs in from AuthContext
  const initUserSession = (dbUser) => {
    setBalance(dbUser.balance ?? 1000);
    setUserProfile(prev => ({
      ...prev,
      username: dbUser.name,
      handle: '@' + dbUser.name.toLowerCase().replace(/\s+/g, ''),
    }));
  };

  // Called on logout
  const resetSession = () => {
    clearStorage();
    setBalance(0);
    setHistory([]);
    setStats({ gamesPlayed: 0, wins: 0, losses: 0, highestWin: 0 });
    setUserProfile({ avatar: '🎮', username: '', handle: '', level: 1, xp: 0 });
    setStreaks({ current: 0, best: 0 });
  };

  const updateBalance = (delta, result = null, game = null) => {
    setBalance(b => Math.max(0, b + delta));
    if (result && game) {
      recordHistory(game, result, Math.abs(delta));
    }
  };

  const spend = (amount) => {
    if (balance >= amount) {
      setBalance(b => b - amount);
      return true;
    }
    return false;
  };

  const earn = (amount) => {
    setBalance(b => b + amount);
  };

  const recordHistory = (game, result, amount) => {
    setHistory(prev => {
      const newHistory = [{
        game,
        result,
        amount,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
      }, ...prev];
      return newHistory.slice(0, 50);
    });
  };

  const processResult = (gameName, wager, resultMultiplier, isWin) => {
    let winnings = 0;
    let resultText = 'Loss';

    if (isWin) {
      winnings = Math.floor(wager * resultMultiplier);
      earn(winnings);
      resultText = 'Win';
    }

    setStats(prev => {
      const newStats = { ...prev };
      newStats.gamesPlayed += 1;
      if (isWin) {
        newStats.wins += 1;
        if (winnings > newStats.highestWin) newStats.highestWin = winnings;
      } else {
        newStats.losses += 1;
      }
      return newStats;
    });

    setStreaks(prev => {
      let current = isWin ? prev.current + 1 : 0;
      let best = Math.max(prev.best, current);
      return { current, best };
    });

    recordHistory(gameName, resultText, isWin ? winnings : wager);
    return { winnings, isWin };
  };

  return (
    <PlayZoneContext.Provider value={{
      balance, spend, earn, updateBalance,
      stats, history, recordHistory, processResult,
      userProfile, setUserProfile, streaks,
      initUserSession, resetSession
    }}>
      {children}
    </PlayZoneContext.Provider>
  );
};

export const usePlayZone = () => useContext(PlayZoneContext);
