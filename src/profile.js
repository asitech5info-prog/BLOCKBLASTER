// Player Profile & Animated Character PFP System
// Provides 8 Boy and 6 Girl animated vector character avatars and player name customization

export const AVATAR_DEFINITIONS = [
  // --- 8 BOY ANIMATED CHARACTERS ---
  {
    id: 'boy_gamer',
    gender: 'boy',
    name: 'Gamer Leo',
    title: 'Pro Esports Cadet',
    accentColor: '#3b82f6',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_leo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e3a8a"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="hair_leo" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
        </defs>
        <!-- Background Circle -->
        <circle cx="50" cy="50" r="48" fill="url(#bg_leo)" stroke="#3b82f6" stroke-width="2.5" class="pfp-rim"/>
        <!-- Animated Headset Arc -->
        <path d="M 22 50 A 28 28 0 0 1 78 50" fill="none" stroke="#60a5fa" stroke-width="5" stroke-linecap="round" class="pfp-headset-glow"/>
        <!-- Body Hoodie -->
        <path d="M 24 88 C 28 72 72 72 76 88 Z" fill="#2563eb"/>
        <path d="M 38 78 L 50 90 L 62 78" fill="none" stroke="#93c5fd" stroke-width="2"/>
        <!-- Neck & Face -->
        <rect x="44" y="62" width="12" height="12" fill="#ffd1b3" rx="3"/>
        <ellipse cx="50" cy="52" rx="20" ry="21" fill="#fed7aa"/>
        <!-- Spiky Hair -->
        <path d="M 28 48 C 28 28 42 22 50 22 C 60 22 72 28 72 48 C 68 36 60 30 50 30 C 40 30 32 36 28 48 Z" fill="url(#hair_leo)"/>
        <path d="M 34 32 L 44 42 L 40 28 L 52 40 L 52 26 L 62 42 L 58 32 L 68 44" fill="url(#hair_leo)" class="pfp-hair-sway"/>
        <!-- Eyes with Animated Blinking / Gamer Glint -->
        <ellipse cx="42" cy="50" rx="3" ry="4" fill="#0f172a" class="pfp-eye"/>
        <ellipse cx="58" cy="50" rx="3" ry="4" fill="#0f172a" class="pfp-eye"/>
        <circle cx="43" cy="49" r="1.2" fill="#ffffff"/>
        <circle cx="59" cy="49" r="1.2" fill="#ffffff"/>
        <!-- Confident Smile -->
        <path d="M 45 61 Q 50 66 55 61" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round"/>
        <!-- Glowing RGB Earcups -->
        <rect x="18" y="42" width="8" height="18" rx="4" fill="#3b82f6" class="pfp-rgb-pulse"/>
        <rect x="74" y="42" width="8" height="18" rx="4" fill="#3b82f6" class="pfp-rgb-pulse"/>
      </svg>
    `
  },
  {
    id: 'boy_cyber',
    gender: 'boy',
    name: 'Cyber Ray',
    title: 'Neon Netrunner',
    accentColor: '#06b6d4',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_ray" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#083344"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
          <linearGradient id="visor_glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#22d3ee"/>
            <stop offset="50%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#a855f7"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_ray)" stroke="#06b6d4" stroke-width="2.5" class="pfp-rim"/>
        <!-- Cyber Halo Pulse -->
        <circle cx="50" cy="50" r="42" fill="none" stroke="#22d3ee" stroke-width="1.5" stroke-dasharray="6,4" class="pfp-spin-halo"/>
        <!-- Jacket -->
        <path d="M 22 88 C 26 70 74 70 78 88 Z" fill="#0f172a"/>
        <path d="M 32 88 L 44 72 L 50 82 L 56 72 L 68 88" fill="#0891b2"/>
        <!-- Face -->
        <ellipse cx="50" cy="52" rx="20" ry="21" fill="#fed7aa"/>
        <!-- Electric Cyan Hair -->
        <path d="M 26 44 C 26 24 38 18 50 18 C 62 18 74 24 74 44 Z" fill="#06b6d4"/>
        <path d="M 30 38 L 42 22 L 48 36 L 56 20 L 62 36 L 70 26 L 68 46" fill="#22d3ee" class="pfp-hair-sway"/>
        <!-- Holographic Cyber Visor -->
        <rect x="30" y="44" width="40" height="12" rx="4" fill="url(#visor_glow)" class="pfp-visor-sweep"/>
        <line x1="32" y1="50" x2="68" y2="50" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
        <!-- Smirk -->
        <path d="M 46 63 Q 52 66 56 62" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round"/>
        <!-- Cyber Ear Piece -->
        <circle cx="28" cy="52" r="3" fill="#22d3ee" class="pfp-rgb-pulse"/>
      </svg>
    `
  },
  {
    id: 'boy_ninja',
    gender: 'boy',
    name: 'Ninja Kaito',
    title: 'Shadow Shinobi',
    accentColor: '#ef4444',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_ninja" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#450a0a"/>
            <stop offset="100%" stop-color="#0a0a0a"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_ninja)" stroke="#ef4444" stroke-width="2.5" class="pfp-rim"/>
        <!-- Shinobi Robe -->
        <path d="M 24 88 C 28 70 72 70 76 88 Z" fill="#18181b"/>
        <path d="M 40 74 L 50 88 L 60 74" fill="none" stroke="#ef4444" stroke-width="2"/>
        <!-- Face -->
        <ellipse cx="50" cy="52" rx="19" ry="21" fill="#fed7aa"/>
        <!-- Spiky Black Anime Hair -->
        <path d="M 24 45 C 24 22 40 16 50 16 C 62 16 76 22 76 45 Z" fill="#18181b"/>
        <path d="M 26 34 L 38 18 L 44 32 L 52 14 L 60 30 L 72 20 L 70 42" fill="#27272a" class="pfp-hair-sway"/>
        <!-- Red Headband with Fluttering Tails -->
        <rect x="29" y="38" width="42" height="8" rx="2" fill="#ef4444"/>
        <path d="M 70 42 Q 86 46 88 56 Q 80 50 71 46" fill="#dc2626" class="pfp-flutter-tails"/>
        <!-- Metal Shinobi Crest -->
        <rect x="44" y="40" width="12" height="4" rx="1" fill="#e4e4e7"/>
        <!-- Fierce Eyes -->
        <polygon points="38,50 44,48 44,52" fill="#09090b"/>
        <polygon points="62,50 56,48 56,52" fill="#09090b"/>
        <circle cx="42" cy="50" r="1" fill="#ffffff"/>
        <circle cx="58" cy="50" r="1" fill="#ffffff"/>
        <!-- Determined Mouth -->
        <line x1="46" y1="63" x2="54" y2="63" stroke="#991b1b" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `
  },
  {
    id: 'boy_astro',
    gender: 'boy',
    name: 'Astro Max',
    title: 'Star Voyager',
    accentColor: '#f59e0b',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_astro" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
          <linearGradient id="visor_gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="50%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#b45309"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_astro)" stroke="#f59e0b" stroke-width="2.5" class="pfp-rim"/>
        <!-- Cosmic Stars -->
        <circle cx="25" cy="25" r="1.5" fill="#fef08a" class="pfp-star-twinkle"/>
        <circle cx="78" cy="28" r="1.5" fill="#fef08a" class="pfp-star-twinkle"/>
        <circle cx="75" cy="72" r="1.2" fill="#fef08a" class="pfp-star-twinkle"/>
        <!-- Spacesuit Collar -->
        <path d="M 22 88 C 26 72 74 72 78 88 Z" fill="#e2e8f0"/>
        <!-- Helmet Outer Shell -->
        <circle cx="50" cy="50" r="30" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
        <!-- Gold Mirror Visor -->
        <ellipse cx="50" cy="50" rx="22" ry="18" fill="url(#visor_gold)" class="pfp-visor-shine"/>
        <path d="M 34 42 Q 50 36 66 42 Q 50 48 34 42" fill="#ffffff" opacity="0.6"/>
        <!-- Antenna with Blinking Beacon -->
        <line x1="50" y1="20" x2="50" y2="12" stroke="#94a3b8" stroke-width="2"/>
        <circle cx="50" cy="11" r="3" fill="#ef4444" class="pfp-rgb-pulse"/>
      </svg>
    `
  },
  {
    id: 'boy_flame',
    gender: 'boy',
    name: 'Flame Buster Kai',
    title: 'Inferno Striker',
    accentColor: '#f97316',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_kai" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#431407"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="hair_flame" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#ea580c"/>
            <stop offset="60%" stop-color="#f97316"/>
            <stop offset="100%" stop-color="#fde047"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_kai)" stroke="#f97316" stroke-width="2.5" class="pfp-rim"/>
        <!-- Martial Gi -->
        <path d="M 24 88 C 28 72 72 72 76 88 Z" fill="#1c1917"/>
        <path d="M 38 76 L 50 90 L 62 76" fill="none" stroke="#f97316" stroke-width="3"/>
        <!-- Face -->
        <ellipse cx="50" cy="54" rx="20" ry="21" fill="#fed7aa"/>
        <!-- Blazing Hair Flames -->
        <path d="M 26 48 C 24 28 34 14 50 14 C 66 14 76 28 74 48 Z" fill="url(#hair_flame)"/>
        <path d="M 32 38 L 40 16 L 46 32 L 52 10 L 60 28 L 68 14 L 68 40" fill="url(#hair_flame)" class="pfp-hair-sway"/>
        <!-- Fiery Eyes -->
        <ellipse cx="42" cy="52" rx="3" ry="4" fill="#c2410c"/>
        <ellipse cx="58" cy="52" rx="3" ry="4" fill="#c2410c"/>
        <circle cx="43" cy="51" r="1.3" fill="#fde047"/>
        <circle cx="59" cy="51" r="1.3" fill="#fde047"/>
        <!-- Grin -->
        <path d="M 44 63 Q 50 68 56 63" fill="none" stroke="#9a3412" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Ember Sparkle -->
        <polygon points="76,36 78,40 82,42 78,44 76,48 74,44 70,42 74,40" fill="#fde047" class="pfp-star-twinkle"/>
      </svg>
    `
  },
  {
    id: 'boy_mage',
    gender: 'boy',
    name: 'Wizard Zephyr',
    title: 'Arcane Mage',
    accentColor: '#a855f7',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_zeph" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2e1065"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_zeph)" stroke="#a855f7" stroke-width="2.5" class="pfp-rim"/>
        <!-- Arcane Runes Spin -->
        <circle cx="50" cy="50" r="42" fill="none" stroke="#c084fc" stroke-width="1.2" stroke-dasharray="4,8" class="pfp-spin-halo"/>
        <!-- Mystic Cloak -->
        <path d="M 24 88 C 28 70 72 70 76 88 Z" fill="#581c87"/>
        <circle cx="50" cy="74" r="4" fill="#facc15" stroke="#7e22ce" stroke-width="1"/>
        <!-- Face -->
        <ellipse cx="50" cy="52" rx="19" ry="20" fill="#fed7aa"/>
        <!-- Silvery Lavender Hair -->
        <path d="M 28 46 C 28 26 40 22 50 22 C 60 22 72 26 72 46 Z" fill="#e9d5ff"/>
        <!-- Arcane Wizard Hat / Hood -->
        <path d="M 22 40 C 30 20 50 14 50 14 C 50 14 70 20 78 40 Z" fill="#3b0764"/>
        <path d="M 44 14 L 62 8 L 52 20 Z" fill="#7e22ce" class="pfp-flutter-tails"/>
        <circle cx="62" cy="8" r="2.5" fill="#facc15"/>
        <!-- Mystic Amethyst Eyes -->
        <ellipse cx="42" cy="52" rx="3" ry="4" fill="#9333ea"/>
        <ellipse cx="58" cy="52" rx="3" ry="4" fill="#9333ea"/>
        <circle cx="43" cy="51" r="1.2" fill="#ffffff"/>
        <circle cx="59" cy="51" r="1.2" fill="#ffffff"/>
        <!-- Subtle Smile -->
        <path d="M 46 62 Q 50 65 54 62" fill="none" stroke="#7e22ce" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `
  },
  {
    id: 'boy_skater',
    gender: 'boy',
    name: 'Cap Boy Dan',
    title: 'Urban Street Jammer',
    accentColor: '#10b981',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_dan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#064e3b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_dan)" stroke="#10b981" stroke-width="2.5" class="pfp-rim"/>
        <!-- Street Denim Jacket -->
        <path d="M 24 88 C 28 72 72 72 76 88 Z" fill="#1e293b"/>
        <path d="M 42 74 L 50 84 L 58 74" fill="#ffffff"/>
        <!-- Face -->
        <ellipse cx="50" cy="54" rx="20" ry="21" fill="#fed7aa"/>
        <!-- Brown Hair Peeking -->
        <path d="M 28 50 C 32 40 40 44 44 50" fill="#78350f"/>
        <path d="M 72 50 C 68 40 60 44 56 50" fill="#78350f"/>
        <!-- Backward Baseball Cap (Emerald Green) -->
        <ellipse cx="50" cy="38" rx="24" ry="14" fill="#059669"/>
        <rect x="42" y="24" width="16" height="6" rx="3" fill="#10b981"/>
        <path d="M 32 40 C 32 44 68 44 68 40" fill="#047857"/>
        <!-- Cool Winking Face -->
        <path d="M 38 52 Q 42 48 46 52" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="58" cy="51" rx="3" ry="4" fill="#0f172a"/>
        <circle cx="59" cy="50" r="1.2" fill="#ffffff"/>
        <!-- Smirk -->
        <path d="M 46 63 Q 54 66 56 61" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round"/>
        <!-- Wireless Airbud -->
        <ellipse cx="28" cy="54" rx="2" ry="4" fill="#ffffff" class="pfp-rgb-pulse"/>
      </svg>
    `
  },
  {
    id: 'boy_mecha',
    gender: 'boy',
    name: 'Mecha Pilot Ren',
    title: 'Aegis Sentinel',
    accentColor: '#14b8a6',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_ren" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#134e4a"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_ren)" stroke="#14b8a6" stroke-width="2.5" class="pfp-rim"/>
        <!-- Sci-Fi Armored Suit -->
        <path d="M 22 88 C 26 70 74 70 78 88 Z" fill="#334155"/>
        <polygon points="50,72 42,88 58,88" fill="#14b8a6"/>
        <!-- Face -->
        <ellipse cx="50" cy="52" rx="20" ry="21" fill="#fed7aa"/>
        <!-- Spiky Ash Silver Hair -->
        <path d="M 26 44 C 26 24 38 18 50 18 C 62 18 74 24 74 44 Z" fill="#cbd5e1"/>
        <path d="M 30 36 L 40 22 L 46 34 L 54 18 L 62 34 L 70 24 L 68 44" fill="#e2e8f0" class="pfp-hair-sway"/>
        <!-- Tactical Green Scouter Over Left Eye -->
        <rect x="52" y="46" width="16" height="10" rx="3" fill="#10b981" opacity="0.85" class="pfp-visor-sweep"/>
        <line x1="52" y1="51" x2="68" y2="51" stroke="#a7f3d0" stroke-width="1.2"/>
        <!-- Right Normal Eye -->
        <ellipse cx="42" cy="51" rx="3" ry="4" fill="#0f172a"/>
        <circle cx="43" cy="50" r="1.2" fill="#ffffff"/>
        <!-- Mouth -->
        <line x1="46" y1="63" x2="54" y2="63" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
        <!-- Mecha Comm Ear Piece -->
        <rect x="72" y="46" width="6" height="14" rx="2" fill="#14b8a6" class="pfp-rgb-pulse"/>
      </svg>
    `
  },

  // --- 6 GIRL ANIMATED CHARACTERS ---
  {
    id: 'girl_cyber',
    gender: 'girl',
    name: 'Cyber Sakura',
    title: 'Neon Valkyrie',
    accentColor: '#ec4899',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_sakura" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#831843"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="hair_pink" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f472b6"/>
            <stop offset="100%" stop-color="#db2777"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_sakura)" stroke="#ec4899" stroke-width="2.5" class="pfp-rim"/>
        <!-- Floating Neon Twin-Tails -->
        <path d="M 28 36 C 14 36 10 60 16 74 C 18 64 22 48 30 44 Z" fill="url(#hair_pink)" class="pfp-hair-sway"/>
        <path d="M 72 36 C 86 36 90 60 84 74 C 82 64 78 48 70 44 Z" fill="url(#hair_pink)" class="pfp-hair-sway"/>
        <!-- Cyber Suit -->
        <path d="M 24 88 C 28 72 72 72 76 88 Z" fill="#1e1b4b"/>
        <path d="M 40 76 L 50 88 L 60 76" fill="none" stroke="#ec4899" stroke-width="2"/>
        <!-- Face -->
        <ellipse cx="50" cy="52" rx="19" ry="20" fill="#fed7aa"/>
        <!-- Anime Bangs -->
        <path d="M 30 38 C 30 22 42 18 50 18 C 58 18 70 22 70 38 Z" fill="url(#hair_pink)"/>
        <path d="M 32 38 L 42 46 L 46 36 L 52 46 L 58 36 L 68 42" fill="url(#hair_pink)"/>
        <!-- Holographic Cyber Glasses -->
        <rect x="32" y="44" width="16" height="10" rx="3" fill="#f43f5e" opacity="0.8" class="pfp-visor-sweep"/>
        <rect x="52" y="44" width="16" height="10" rx="3" fill="#06b6d4" opacity="0.8" class="pfp-visor-sweep"/>
        <line x1="48" y1="49" x2="52" y2="49" stroke="#ffffff" stroke-width="1.5"/>
        <!-- Cute Blush -->
        <ellipse cx="36" cy="57" rx="3" ry="1.5" fill="#f472b6" opacity="0.6"/>
        <ellipse cx="64" cy="57" rx="3" ry="1.5" fill="#f472b6" opacity="0.6"/>
        <!-- Smile -->
        <path d="M 46 62 Q 50 66 54 62" fill="none" stroke="#e11d48" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `
  },
  {
    id: 'girl_luna',
    gender: 'girl',
    name: 'Star Mage Luna',
    title: 'Celestial Sorceress',
    accentColor: '#8b5cf6',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_luna" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b0764"/>
            <stop offset="100%" stop-color="#09090b"/>
          </linearGradient>
          <linearGradient id="hair_violet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#c084fc"/>
            <stop offset="100%" stop-color="#7e22ce"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_luna)" stroke="#8b5cf6" stroke-width="2.5" class="pfp-rim"/>
        <!-- Celestial Starfield Orbit -->
        <circle cx="50" cy="50" r="42" fill="none" stroke="#c084fc" stroke-width="1.2" stroke-dasharray="3,7" class="pfp-spin-halo"/>
        <!-- Flowing Purple Hair Backdrop -->
        <path d="M 22 40 C 14 54 16 80 26 88 C 24 74 26 56 32 46 Z" fill="url(#hair_violet)" class="pfp-hair-sway"/>
        <path d="M 78 40 C 86 54 84 80 74 88 C 76 74 74 56 68 46 Z" fill="url(#hair_violet)" class="pfp-hair-sway"/>
        <!-- Silken Robe -->
        <path d="M 24 88 C 28 72 72 72 76 88 Z" fill="#4c1d95"/>
        <circle cx="50" cy="74" r="3.5" fill="#facc15"/>
        <!-- Face -->
        <ellipse cx="50" cy="52" rx="19" ry="20" fill="#fed7aa"/>
        <!-- Soft Fringe Hair -->
        <path d="M 30 36 C 30 20 42 16 50 16 C 58 16 70 20 70 36 Z" fill="url(#hair_violet)"/>
        <path d="M 34 36 L 42 44 L 46 36 L 54 44 L 58 36 L 66 42" fill="url(#hair_violet)"/>
        <!-- Crescent Moon Tiara -->
        <path d="M 46 22 A 6 6 0 1 0 54 22 A 4 4 0 1 1 46 22 Z" fill="#facc15" class="pfp-star-twinkle"/>
        <!-- Glowing Big Anime Eyes -->
        <ellipse cx="42" cy="51" rx="3.5" ry="4.5" fill="#581c87"/>
        <ellipse cx="58" cy="51" rx="3.5" ry="4.5" fill="#581c87"/>
        <circle cx="43" cy="49" r="1.5" fill="#ffffff"/>
        <circle cx="59" cy="49" r="1.5" fill="#ffffff"/>
        <!-- Sweet Smile -->
        <path d="M 46 62 Q 50 66 54 62" fill="none" stroke="#7e22ce" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `
  },
  {
    id: 'girl_gamer',
    gender: 'girl',
    name: 'Gamer Chloe',
    title: 'Twitch Star Champion',
    accentColor: '#14b8a6',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_chloe" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#115e59"/>
            <stop offset="100%" stop-color="#022c22"/>
          </linearGradient>
          <linearGradient id="hair_teal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#2dd4bf"/>
            <stop offset="100%" stop-color="#0f766e"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_chloe)" stroke="#14b8a6" stroke-width="2.5" class="pfp-rim"/>
        <!-- Glowing Cat/Fox Ear Headset -->
        <path d="M 26 50 A 24 24 0 0 1 74 50" fill="none" stroke="#ffffff" stroke-width="4"/>
        <polygon points="30,34 38,16 46,30" fill="#2dd4bf" class="pfp-rgb-pulse"/>
        <polygon points="34,32 38,20 42,30" fill="#ccfbf1"/>
        <polygon points="54,30 62,16 70,34" fill="#2dd4bf" class="pfp-rgb-pulse"/>
        <polygon points="58,30 62,20 66,32" fill="#ccfbf1"/>
        <!-- Hoodie -->
        <path d="M 24 88 C 28 72 72 72 76 88 Z" fill="#042f2e"/>
        <!-- Face -->
        <ellipse cx="50" cy="54" rx="19" ry="20" fill="#fed7aa"/>
        <!-- Teal Anime Hair Buns -->
        <circle cx="26" cy="40" r="8" fill="url(#hair_teal)"/>
        <circle cx="74" cy="40" r="8" fill="url(#hair_teal)"/>
        <path d="M 30 38 C 30 24 42 20 50 20 C 58 20 70 24 70 38 Z" fill="url(#hair_teal)"/>
        <path d="M 34 38 L 44 48 L 48 38 L 52 48 L 58 38 L 66 44" fill="url(#hair_teal)"/>
        <!-- Big Teal Sparkling Eyes -->
        <ellipse cx="42" cy="53" rx="3.5" ry="4.5" fill="#0f766e"/>
        <ellipse cx="58" cy="53" rx="3.5" ry="4.5" fill="#0f766e"/>
        <circle cx="43" cy="51" r="1.5" fill="#ffffff"/>
        <circle cx="59" cy="51" r="1.5" fill="#ffffff"/>
        <!-- Cheerful Smile -->
        <path d="M 45 64 Q 50 68 55 64" fill="none" stroke="#0f766e" stroke-width="2" stroke-linecap="round"/>
        <!-- Pink Blush -->
        <ellipse cx="36" cy="59" rx="3" ry="1.5" fill="#f43f5e" opacity="0.6"/>
        <ellipse cx="64" cy="59" rx="3" ry="1.5" fill="#f43f5e" opacity="0.6"/>
      </svg>
    `
  },
  {
    id: 'girl_ninja',
    gender: 'girl',
    name: 'Shinobi Aoi',
    title: 'Lotus Blade',
    accentColor: '#38bdf8',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_aoi" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0c4a6e"/>
            <stop offset="100%" stop-color="#030712"/>
          </linearGradient>
          <linearGradient id="hair_blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_aoi)" stroke="#38bdf8" stroke-width="2.5" class="pfp-rim"/>
        <!-- High Ponytail Swaying to Right -->
        <path d="M 66 32 C 84 28 92 48 88 68 C 80 58 76 44 64 38 Z" fill="url(#hair_blue)" class="pfp-hair-sway"/>
        <circle cx="68" cy="34" r="4" fill="#f43f5e"/>
        <!-- Shinobi Kimono -->
        <path d="M 24 88 C 28 72 72 72 76 88 Z" fill="#0f172a"/>
        <path d="M 40 74 L 50 88 L 60 74" fill="none" stroke="#38bdf8" stroke-width="2"/>
        <!-- Face -->
        <ellipse cx="50" cy="53" rx="19" ry="20" fill="#fed7aa"/>
        <!-- Sleek Blue Hair -->
        <path d="M 28 38 C 28 22 42 18 50 18 C 58 18 72 22 72 38 Z" fill="url(#hair_blue)"/>
        <path d="M 32 38 L 44 48 L 48 38 L 56 46 L 68 40" fill="url(#hair_blue)"/>
        <!-- Cherry Blossom Petals -->
        <circle cx="26" cy="30" r="2.5" fill="#f472b6" class="pfp-star-twinkle"/>
        <!-- Deep Blue Determined Eyes -->
        <ellipse cx="42" cy="52" rx="3.5" ry="4.5" fill="#0369a1"/>
        <ellipse cx="58" cy="52" rx="3.5" ry="4.5" fill="#0369a1"/>
        <circle cx="43" cy="50" r="1.4" fill="#ffffff"/>
        <circle cx="59" cy="50" r="1.4" fill="#ffffff"/>
        <!-- Subtle Smile -->
        <path d="M 46 63 Q 50 66 54 63" fill="none" stroke="#0284c7" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `
  },
  {
    id: 'girl_sun',
    gender: 'girl',
    name: 'Solar Princess Mia',
    title: 'Radiant Dawn',
    accentColor: '#eab308',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_mia" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#713f12"/>
            <stop offset="100%" stop-color="#18181b"/>
          </linearGradient>
          <linearGradient id="hair_gold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="100%" stop-color="#ca8a04"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_mia)" stroke="#eab308" stroke-width="2.5" class="pfp-rim"/>
        <!-- Sunburst Halo -->
        <circle cx="50" cy="50" r="42" fill="none" stroke="#fde047" stroke-width="1.5" stroke-dasharray="8,6" class="pfp-spin-halo"/>
        <!-- Lush Golden Curls Falling -->
        <path d="M 22 42 C 14 56 16 80 26 88 C 24 74 26 56 32 46 Z" fill="url(#hair_gold)" class="pfp-hair-sway"/>
        <path d="M 78 42 C 86 56 84 80 74 88 C 76 74 74 56 68 46 Z" fill="url(#hair_gold)" class="pfp-hair-sway"/>
        <!-- Royal Gown -->
        <path d="M 24 88 C 28 72 72 72 76 88 Z" fill="#854d0e"/>
        <circle cx="50" cy="74" r="4" fill="#fef08a"/>
        <!-- Face -->
        <ellipse cx="50" cy="52" rx="19" ry="20" fill="#fed7aa"/>
        <!-- Golden Tiara -->
        <polygon points="40,24 45,18 50,22 55,18 60,24 50,26" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
        <circle cx="50" cy="20" r="1.5" fill="#ef4444"/>
        <!-- Bangs -->
        <path d="M 30 36 C 30 22 42 18 50 18 C 58 18 70 22 70 36 Z" fill="url(#hair_gold)"/>
        <path d="M 34 36 L 42 44 L 48 36 L 54 44 L 66 40" fill="url(#hair_gold)"/>
        <!-- Sparkling Honey Eyes -->
        <ellipse cx="42" cy="51" rx="3.5" ry="4.5" fill="#a16207"/>
        <ellipse cx="58" cy="51" rx="3.5" ry="4.5" fill="#a16207"/>
        <circle cx="43" cy="49" r="1.5" fill="#ffffff"/>
        <circle cx="59" cy="49" r="1.5" fill="#ffffff"/>
        <!-- Warm Gentle Smile -->
        <path d="M 46 62 Q 50 66 54 62" fill="none" stroke="#a16207" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `
  },
  {
    id: 'girl_valkyrie',
    gender: 'girl',
    name: 'Valkyrie Nova',
    title: 'Cyber Ace Pilot',
    accentColor: '#a855f7',
    svg: `
      <svg viewBox="0 0 100 100" class="avatar-svg animated-avatar" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg_nova" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4c1d95"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
          <linearGradient id="hair_silver" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f1f5f9"/>
            <stop offset="100%" stop-color="#94a3b8"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bg_nova)" stroke="#a855f7" stroke-width="2.5" class="pfp-rim"/>
        <!-- Futuristic Armor Collar -->
        <path d="M 22 88 C 26 70 74 70 78 88 Z" fill="#1e1b4b"/>
        <polygon points="50,72 40,88 60,88" fill="#a855f7"/>
        <!-- Face -->
        <ellipse cx="50" cy="52" rx="19" ry="20" fill="#fed7aa"/>
        <!-- Sharp Silver Bob Haircut -->
        <path d="M 26 42 C 26 22 38 18 50 18 C 62 18 74 22 74 42 Z" fill="url(#hair_silver)"/>
        <path d="M 26 42 L 30 62 L 36 46 L 46 38 L 56 46 L 64 62 L 74 42" fill="url(#hair_silver)" class="pfp-hair-sway"/>
        <!-- Neon Magenta Tactical Eyepiece -->
        <rect x="32" y="44" width="16" height="10" rx="3" fill="#d946ef" opacity="0.85" class="pfp-visor-sweep"/>
        <line x1="32" y1="49" x2="48" y2="49" stroke="#fbcfe8" stroke-width="1.2"/>
        <!-- Right Normal Eye -->
        <ellipse cx="58" cy="49" rx="3.5" ry="4.5" fill="#4c1d95"/>
        <circle cx="59" cy="48" r="1.5" fill="#ffffff"/>
        <!-- Confident Smirk -->
        <path d="M 46 62 Q 52 65 56 61" fill="none" stroke="#7e22ce" stroke-width="2" stroke-linecap="round"/>
        <!-- Cyber Ear Piece -->
        <circle cx="74" cy="50" r="3" fill="#d946ef" class="pfp-rgb-pulse"/>
      </svg>
    `
  }
];

class ProfileManager {
  constructor() {
    this.name = localStorage.getItem('bb_player_name') || 'Block Master';
    this.currentPfp = localStorage.getItem('bb_player_pfp') || 'boy_gamer';
    this.listeners = [];
  }

  getName() {
    return this.name;
  }

  setName(newName) {
    const cleanName = (newName || '').trim();
    if (!cleanName) return false;
    this.name = cleanName.slice(0, 16);
    localStorage.setItem('bb_player_name', this.name);
    this.notify();
    return true;
  }

  getPfp() {
    return this.currentPfp;
  }

  setPfp(avatarId) {
    const exists = AVATAR_DEFINITIONS.some(a => a.id === avatarId);
    if (!exists) return false;
    this.currentPfp = avatarId;
    localStorage.setItem('bb_player_pfp', this.currentPfp);
    this.notify();
    return true;
  }

  getCurrentAvatar() {
    return AVATAR_DEFINITIONS.find(a => a.id === this.currentPfp) || AVATAR_DEFINITIONS[0];
  }

  getAvatars(gender = 'all') {
    if (gender === 'boy') {
      return AVATAR_DEFINITIONS.filter(a => a.gender === 'boy');
    }
    if (gender === 'girl') {
      return AVATAR_DEFINITIONS.filter(a => a.gender === 'girl');
    }
    return AVATAR_DEFINITIONS;
  }

  getAvatarById(id) {
    return AVATAR_DEFINITIONS.find(a => a.id === id) || AVATAR_DEFINITIONS[0];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.name, this.getCurrentAvatar());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    const avatar = this.getCurrentAvatar();
    this.listeners.forEach(cb => {
      try {
        cb(this.name, avatar);
      } catch (err) {
        console.error('Profile listener error:', err);
      }
    });

    // Update all profile name and avatar elements in DOM
    document.querySelectorAll('.player-name-display').forEach(el => {
      el.textContent = this.name;
    });

    document.querySelectorAll('.player-avatar-slot').forEach(el => {
      el.innerHTML = avatar.svg;
    });
  }
}

export const profileManager = new ProfileManager();
