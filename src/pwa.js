// src/pwa.js
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Recharge automatiquement dès qu'une nouvelle version est détectée
    updateSW(true);
  },
  onOfflineReady() {
    console.log("✅ App prête hors-ligne");
  }
});