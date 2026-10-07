// BB Coin Currency & Economy Engine for Block Blaster
// Currency used for Skin Shop, Revives, and earned through Adventure, Combos, and Daily Chests

class CoinWallet {
  constructor() {
    this.balance = parseInt(localStorage.getItem('bb_coins') || '250', 10);
    this.totalEarned = parseInt(localStorage.getItem('bb_stat_total_coins_earned') || '250', 10);
    this.listeners = [];
  }

  getBalance() {
    return this.balance;
  }

  getTotalEarned() {
    return this.totalEarned;
  }

  addCoins(amount, reason = '') {
    if (amount <= 0) return this.balance;
    this.balance += amount;
    this.totalEarned += amount;
    localStorage.setItem('bb_coins', String(this.balance));
    localStorage.setItem('bb_stat_total_coins_earned', String(this.totalEarned));
    this.notify(amount, 'earn', reason);
    return this.balance;
  }

  spendCoins(amount, reason = '') {
    if (amount <= 0) return true;
    if (this.balance < amount) return false;
    this.balance -= amount;
    localStorage.setItem('bb_coins', String(this.balance));
    this.notify(amount, 'spend', reason);
    return true;
  }

  canAfford(amount) {
    return this.balance >= amount;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.balance, 0, 'init');
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(delta, type, reason) {
    this.listeners.forEach(cb => {
      try {
        cb(this.balance, delta, type, reason);
      } catch (err) {
        console.error('Wallet subscriber error:', err);
      }
    });

    // Animate coin elements on screen
    document.querySelectorAll('.bb-coin-amount').forEach(el => {
      el.textContent = this.balance.toLocaleString();
      el.classList.remove('coin-pulse');
      void el.offsetWidth; // Trigger reflow
      el.classList.add('coin-pulse');
    });
  }
}

export const wallet = new CoinWallet();
