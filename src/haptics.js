// Tactile Haptic Vibration & Controls Settings Engine for Block Blaster
// Provides mobile haptic feedback and user customizable drag & drop controls

class HapticsAndControlsManager {
  constructor() {
    this.enabled = localStorage.getItem('bb_haptics_enabled') !== 'false';
    this.intensity = localStorage.getItem('bb_haptics_intensity') || 'medium'; // 'light' | 'medium' | 'heavy'
    this.touchOffsetMode = localStorage.getItem('bb_touch_offset_mode') || 'above'; // 'above' | 'direct' | 'high'
    this.snapSensitivity = localStorage.getItem('bb_snap_sensitivity') || 'normal'; // 'normal' | 'snappy'

    this.canVibrate = typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function';
  }

  // --- Haptic Feedback Methods ---
  getIntensityMultiplier() {
    switch (this.intensity) {
      case 'light': return 0.6;
      case 'heavy': return 1.5;
      case 'medium':
      default: return 1.0;
    }
  }

  vibrate(pattern) {
    if (!this.enabled || !this.canVibrate) return;
    try {
      const mult = this.getIntensityMultiplier();
      if (Array.isArray(pattern)) {
        const scaled = pattern.map((ms, idx) => (idx % 2 === 0 ? Math.round(ms * mult) : ms));
        navigator.vibrate(scaled);
      } else {
        navigator.vibrate(Math.round(pattern * mult));
      }
    } catch (e) {
      // Ignore vibration errors on unsupported platforms
    }
  }

  // Quick light tap on grabbing piece
  tapPiece() {
    this.vibrate(15);
  }

  // Solid tactile click on dropping piece onto board
  snapPiece() {
    this.vibrate(28);
  }

  // Double pulse when clearing lines
  lineClear(lineCount = 1) {
    if (lineCount >= 3) {
      this.vibrate([40, 25, 60, 25, 90]);
    } else if (lineCount === 2) {
      this.vibrate([35, 25, 55]);
    } else {
      this.vibrate([30, 20, 40]);
    }
  }

  // Multi-pulse celebration on combo
  combo(comboLevel) {
    const pulses = Math.min(comboLevel, 4);
    const pattern = [];
    for (let i = 0; i < pulses; i++) {
      pattern.push(35 + i * 10);
      if (i < pulses - 1) pattern.push(30);
    }
    this.vibrate(pattern);
  }

  // Grand fanfare vibration on Level Win, Revive, or Chest Opening
  fanfare() {
    this.vibrate([50, 30, 60, 30, 80, 40, 150]);
  }

  // Error buzz
  error() {
    this.vibrate([40, 40, 40]);
  }

  // --- Settings Accessors ---
  isHapticsEnabled() {
    return this.enabled;
  }

  setHapticsEnabled(val) {
    this.enabled = !!val;
    localStorage.setItem('bb_haptics_enabled', String(this.enabled));
    if (this.enabled) this.tapPiece();
  }

  getIntensity() {
    return this.intensity;
  }

  setIntensity(level) {
    if (['light', 'medium', 'heavy'].includes(level)) {
      this.intensity = level;
      localStorage.setItem('bb_haptics_intensity', level);
      this.snapPiece();
    }
  }

  // --- Controls & Drag Offset Settings ---
  getTouchOffsetMode() {
    return this.touchOffsetMode;
  }

  setTouchOffsetMode(mode) {
    if (['above', 'direct', 'high'].includes(mode)) {
      this.touchOffsetMode = mode;
      localStorage.setItem('bb_touch_offset_mode', mode);
    }
  }

  getTouchOffsetY() {
    switch (this.touchOffsetMode) {
      case 'direct': return 0;
      case 'high': return -100;
      case 'above':
      default: return -70; // Standard block blaster fingertip visibility offset
    }
  }

  getSnapSensitivity() {
    return this.snapSensitivity;
  }

  setSnapSensitivity(sensitivity) {
    if (['normal', 'snappy'].includes(sensitivity)) {
      this.snapSensitivity = sensitivity;
      localStorage.setItem('bb_snap_sensitivity', sensitivity);
    }
  }
}

export const haptics = new HapticsAndControlsManager();
