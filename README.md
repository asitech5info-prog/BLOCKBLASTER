# 💥 Block Blaster

[![Release](https://img.shields.io/github/v/release/asitech5info-prog/BlockBlaster?color=2ed573&label=Release)](https://github.com/asitech5info-prog/BlockBlaster/releases/tag/v1.0.0)
[![Android APK](https://img.shields.io/badge/Download-Android%20APK%20(v1.0.0)-00d2ff?logo=android&logoColor=white)](https://github.com/asitech5info-prog/BlockBlaster/releases/download/v1.0.0/BlockBlaster-v1.0.0.apk)

A fast, addictive, mobile-first block puzzle blast game built for **Web, iOS, and Android (Play Store)**. Inspired by Block Blast!, featuring glowing jewel visuals, dynamic combo chains, explosive line blast effects, and zero-dependency Web Audio sound effects.

### 📥 [Direct Download APK v1.0.0 (3.64 MB)](https://github.com/asitech5info-prog/BlockBlaster/releases/download/v1.0.0/BlockBlaster-v1.0.0.apk)

![Block Blaster Banner](public/icon.svg)

---

## 🎮 Key Features

- **8x8 Classic Grid**: Perfectly calibrated board with smooth tactile snapping.
- **Dynamic Combo System**: Clearing lines sequentially triggers combo multipliers (`COMBO x2`, `COMBO x3`...) with escalating harmonic chords.
- **Multi-Line Blasts**: Clear rows and columns simultaneously for huge mega-clear bonuses and particle explosions.
- **Tactile Drag-and-Drop & Touch Support**:
  - Unified pointer events with mobile finger-offset (prevents finger from blocking your view on touch screens).
  - Tap-to-select and tap-to-place accessibility fallback.
  - Ghost preview highlights showing valid vs invalid placements in real time.
- **Web Audio Sound Synthesizer**: Built-in procedural audio engine (pickups, snaps, harmonic line clears, game over themes) with persistent mute/unmute toggle.
- **Cross-Platform Readiness**:
  - **Web / Mobile Browser**: Responsive PWA support.
  - **Android (Google Play Store)**: Capacitor native Android project (`android/`) with automatic APK generation.
  - **iOS (App Store)**: Ready for Capacitor iOS packaging.
- **Automated E2E Verification**: Comprehensive Playwright test suite covering all core game mechanics.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser or mobile device.

### 3. Run Playwright Automated Tests
```bash
npm run test
```
Runs 6 automated end-to-end tests validating UI rendering, audio toggle, click-to-place, drag-and-drop, row clearing combos, and game over handling.

---

## 📱 Mobile APK & Store Deployment

### Automated GitHub Actions APK Build
This repository includes `.github/workflows/build-apk.yml`.
When pushed to GitHub:
1. GitHub Actions automatically sets up Node.js, Java JDK 17, and the Android SDK.
2. Compiles the web app and syncs with Capacitor Android.
3. Builds `app-debug.apk`.
4. Uploads the ready-to-install `.apk` file under the workflow **Artifacts** tab for direct 1-click download!

### Manual Android Build via Android Studio
```bash
npm run build
npx cap sync android
npx cap open android
```
Inside Android Studio, select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
