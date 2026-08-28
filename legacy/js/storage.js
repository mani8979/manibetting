// LocalStorage wrapper utility

const STORAGE_PREFIX = 'playzone_';

const Storage = {
  get(key) {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      return data; // Not JSON
    }
  },

  set(key, value) {
    const val = typeof value === 'object' ? JSON.stringify(value) : value;
    localStorage.setItem(STORAGE_PREFIX + key, val);
  },

  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  clear() {
    // Only clear playzone keys
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
  },
  
  // Initialization for first-time users
  initDefaults() {
    if (this.get('balance') === null) {
      this.set('balance', 10000); // 10k starting virtual coins
    }
    if (this.get('history') === null) {
      this.set('history', []);
    }
    if (this.get('stats') === null) {
      this.set('stats', {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        highestWin: 0
      });
    }
  }
};

// Auto-init on load
Storage.initDefaults();

window.Storage = Storage;
