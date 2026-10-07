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
    price: 1500,
    tag: 'Popular',
    icon: '🍪',
    desc: 'Crunchy golden baked crackers with crispy dots and scalloped edges.',
    cssClass: 'skin-biscuit',
    previewColors: ['#dfa868', '#c98f4d', '#dfa868', '#b57936']
  },
  {
    id: 'cheese',
    name: 'Swiss Cheese',
    price: 2500,
    tag: 'Tasty',
    icon: '🧀',
    desc: 'Savory golden cheese blocks with 3D gourmet cheese holes.',
    cssClass: 'skin-cheese',
    previewColors: ['#ffc837', '#ffb300', '#ffc837', '#ffa000']
  },
  {
    id: 'candy',
    name: 'Jelly Gummy',
    price: 3500,
    tag: 'Sweet',
    icon: '🍬',
    desc: 'Glossy translucent fruit candy with luscious squishy jelly gleam.',
    cssClass: 'skin-candy',
    previewColors: ['#b388ff', '#00e5ff', '#ea80fc', '#80d8ff']
  },
  {
    id: 'wood',
    name: 'Artisan Timber',
    price: 5000,
    tag: 'Craft',
    icon: '🪵',
    desc: 'Handcrafted mahogany timber blocks with rich wood grain bevels.',
    cssClass: 'skin-wood',
    previewColors: ['#a06a3e', '#8b5a2b', '#a06a3e', '#6e441b']
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    price: 7500,
    tag: 'Futuristic',
    icon: '⚡',
    desc: 'High-tech sci-fi grid cells with pulsating neon lasers and dark chrome.',
    cssClass: 'skin-cyber',
    previewColors: ['#00f0ff', '#ff007f', '#39ff14', '#00f0ff']
  },
  {
    id: 'royal',
    name: 'Golden Royalty',
    price: 10000,
    tag: 'VIP Luxury',
    icon: '👑',
    desc: 'Pure 24K gilded gold tiles crowned with sparkling diamond facets.',
    cssClass: 'skin-royal',
    previewColors: ['#ffd700', '#ffae19', '#ffe066', '#d4af37']
  },
  {
    id: 'ice',
    name: 'Glacial Crystal',
    price: 12500,
    tag: 'Legendary',
    icon: '❄️',
    desc: 'Chiseled sub-zero arctic ice crystal blocks with deep frost refraction.',
    cssClass: 'skin-ice',
    previewColors: ['#a7f3d0', '#67e8f9', '#38bdf8', '#bae6fd']
  },
  {
    id: 'obsidian',
    name: 'Obsidian Void',
    price: 15000,
    tag: 'Mythic',
    icon: '🔮',
    desc: 'Deep cosmic obsidian stone with luminescent violet energy fissures.',
    cssClass: 'skin-obsidian',
    previewColors: ['#1e1035', '#a855f7', '#3b0764', '#c084fc']
  },
  {
    id: 'emerald',
    name: 'Emerald Dynasty',
    price: 18000,
    tag: 'Imperial',
    icon: '🐉',
    desc: 'Gleaming imperial jade facets bounded by polished golden filigree.',
    cssClass: 'skin-emerald',
    previewColors: ['#047857', '#10b981', '#065f46', '#34d399']
  },
  {
    id: 'galaxy',
    name: 'Cosmic Galaxy',
    price: 20000,
    tag: 'Celestial',
    icon: '🌌',
    desc: 'Swirling deep-space nebulae embedded with radiant stardust clusters.',
    cssClass: 'skin-galaxy',
    previewColors: ['#312e81', '#818cf8', '#4338ca', '#c7d2fe']
  },
  {
    id: 'magma',
    name: 'Infernal Magma',
    price: 25000,
    tag: 'Elemental',
    icon: '🌋',
    desc: 'Smoldering volcanic basalt stone glowing with molten molten lava rivers.',
    cssClass: 'skin-magma',
    previewColors: ['#450a0a', '#ef4444', '#7f1d1d', '#f97316']
  },
  {
    id: 'prism',
    name: 'Prism Diamond',
    price: 30000,
    tag: 'Exotic',
    icon: '🌈',
    desc: 'Flawless optical diamond prism refracting dazzling rainbow spectral light.',
    cssClass: 'skin-prism',
    previewColors: ['#f43f5e', '#ec4899', '#8b5cf6', '#06b6d4']
  },
  {
    id: 'mecha',
    name: 'Carbon Mecha',
    price: 35000,
    tag: 'Titan Tech',
    icon: '🤖',
    desc: 'Aero-grade weave carbon fiber armor laced with electric cyan circuit lines.',
    cssClass: 'skin-mecha',
    previewColors: ['#0f172a', '#06b6d4', '#1e293b', '#22d3ee']
  }
];

class SkinManager {
  constructor() {
    this.unlocked = this.loadUnlockedSkins();
    this.equipped = localStorage.getItem('bb_equipped_skin') || 'classic';
    this.applySkinToBody();
  }

  loadUnlockedSkins() {
    try {
      const saved = JSON.parse(localStorage.getItem('bb_unlocked_skins') || '["classic"]');
      if (Array.isArray(saved) && saved.length > 0) {
        if (!saved.includes('classic')) saved.unshift('classic');
        return Array.from(new Set(saved));
      }
    } catch (e) {
      console.warn('Failed to parse unlocked skins, resetting to default', e);
    }
    return ['classic'];
  }

  saveUnlockedSkins() {
    localStorage.setItem('bb_unlocked_skins', JSON.stringify(Array.from(new Set(this.unlocked))));
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

  isUnlocked(id) {
    return this.isSkinUnlocked(id);
  }

  getCurrentSkinId() {
    return this.equipped;
  }

  buySkin(id) {
    const skin = SKINS_CATALOG.find(s => s.id === id);
    if (!skin) return { success: false, reason: 'Skin not found' };
    if (this.isSkinUnlocked(id)) {
      this.equipSkin(id);
      return { success: true, reason: 'Already unlocked' };
    }

    if (!wallet.canAfford(skin.price)) {
      return { success: false, reason: `Not enough BB Coins! Need ${skin.price.toLocaleString()} 🪙` };
    }

    if (wallet.spendCoins(skin.price, `Buy skin: ${skin.name}`)) {
      if (!this.unlocked.includes(id)) {
        this.unlocked.push(id);
      }
      this.saveUnlockedSkins();
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
