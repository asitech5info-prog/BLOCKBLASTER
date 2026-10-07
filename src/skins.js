// Skin Shop & Custom Block Skins Engine for Block Blaster
// Integrates with BB Coins and transforms game blocks visually
import { wallet } from './coins.js';
import { sound } from './audio.js';

export const SKINS_CATALOG = [
  {
    id: 'classic',
    name: 'Vibrant Gems',
    price: 0,
    tag: 'Classic',
    icon: '💎',
    desc: 'The timeless, juicy 3D gem blocks with vibrant color gradients.',
    cssClass: 'skin-classic',
    previewColors: ['#ff4081', '#00e5ff', '#ffb300', '#76ff03']
  },
  {
    id: 'biscuit',
    name: 'Crispy Cracker',
    price: 150,
    tag: 'Popular',
    icon: '🍪',
    desc: 'Crunchy golden baked crackers with crispy dots and scalloped edges.',
    cssClass: 'skin-biscuit',
    previewColors: ['#dfa868', '#c98f4d', '#dfa868', '#b57936']
  },
  {
    id: 'cheese',
    name: 'Swiss Cheese',
    price: 200,
    tag: 'Tasty',
    icon: '🧀',
    desc: 'Savory golden cheese blocks with 3D gourmet cheese holes.',
    cssClass: 'skin-cheese',
    previewColors: ['#ffc837', '#ffb300', '#ffc837', '#ffa000']
  },
  {
    id: 'candy',
    name: 'Jelly Gummy',
    price: 250,
    tag: 'Sweet',
    icon: '🍬',
    desc: 'Glossy translucent fruit candy with luscious squishy jelly gleam.',
    cssClass: 'skin-candy',
    previewColors: ['#b388ff', '#00e5ff', '#ea80fc', '#80d8ff']
  },
  {
    id: 'wood',
    name: 'Artisan Timber',
    price: 300,
    tag: 'Craft',
    icon: '🪵',
    desc: 'Handcrafted mahogany timber blocks with rich wood grain bevels.',
    cssClass: 'skin-wood',
    previewColors: ['#a06a3e', '#8b5a2b', '#a06a3e', '#6e441b']
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    price: 400,
    tag: 'Futuristic',
    icon: '⚡',
    desc: 'High-tech sci-fi grid cells with pulsating neon lasers and dark chrome.',
    cssClass: 'skin-cyber',
    previewColors: ['#00f0ff', '#ff007f', '#39ff14', '#00f0ff']
  },
  {
    id: 'royal',
    name: 'Golden Royalty',
    price: 500,
    tag: 'VIP Luxury',
    icon: '👑',
    desc: 'Pure 24K gilded gold tiles crowned with sparkling diamond facets.',
    cssClass: 'skin-royal',
    previewColors: ['#ffd700', '#ffae19', '#ffe066', '#d4af37']
  },
  {
    id: 'ice',
    name: 'Glacial Crystal',
    price: 600,
    tag: 'Legendary',
    icon: '❄️',
    desc: 'Chiseled sub-zero arctic ice crystal blocks with deep frost refraction.',
    cssClass: 'skin-ice',
    previewColors: ['#a7f3d0', '#67e8f9', '#38bdf8', '#bae6fd']
  }
];

class SkinManager {
  constructor() {
    this.unlocked = JSON.parse(localStorage.getItem('bb_unlocked_skins') || '["classic"]');
    this.equipped = localStorage.getItem('bb_equipped_skin') || 'classic';
    this.applySkinToBody();
  }

  getAllSkins() {
    return SKINS_CATALOG;
  }

  getEquippedSkin() {
    return this.equipped;
  }

  isSkinUnlocked(id) {
    return this.unlocked.includes(id);
  }

  buySkin(id) {
    const skin = SKINS_CATALOG.find(s => s.id === id);
    if (!skin) return { success: false, reason: 'Skin not found' };
    if (this.isSkinUnlocked(id)) return { success: true, reason: 'Already unlocked' };

    if (!wallet.canAfford(skin.price)) {
      return { success: false, reason: 'Not enough BB Coins' };
    }

    if (wallet.spendCoins(skin.price, `Buy skin: ${skin.name}`)) {
      this.unlocked.push(id);
      this.equipSkin(id);
      if (typeof sound?.playMedalCelebration === 'function') {
        sound.playMedalCelebration();
      } else if (typeof sound?.playComboFanfare === 'function') {
        sound.playComboFanfare();
      }
      return { success: true, skin };
    }

    return { success: false, reason: 'Transaction failed' };
  }

  equipSkin(id) {
    if (!this.isSkinUnlocked(id)) return false;
    this.equipped = id;
    localStorage.setItem('bb_equipped_skin', id);
    this.applySkinToBody();
    sound.playClick();
    return true;
  }

  applySkinToBody() {
    // Remove old skin classes from root element
    SKINS_CATALOG.forEach(s => {
      document.body.classList.remove(s.cssClass);
      const app = document.getElementById('app');
      if (app) app.classList.remove(s.cssClass);
    });

    const currentSkin = SKINS_CATALOG.find(s => s.id === this.equipped) || SKINS_CATALOG[0];
    document.body.classList.add(currentSkin.cssClass);
    const app = document.getElementById('app');
    if (app) app.classList.add(currentSkin.cssClass);
  }
}

export const skinManager = new SkinManager();
