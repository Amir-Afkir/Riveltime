// src/components/ui/UpdateBanner.jsx
import NotificationBanner from "./NotificationBanner";
import { usePwaUpdater } from "../../pwa"; // importe ton hook personnalisé
import { useEffect } from "react";

export default function UpdateBanner() {
  const {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    close,
  } = usePwaUpdater();

  // Optionnel : toast quand dispo hors-ligne
  useEffect(() => {
    if (offlineReady) {
      console.log("✅ Riveltime est maintenant dispo hors-ligne");
      // Affiche une notification ou un toast, ex: avec react-hot-toast
    }
  }, [offlineReady]);

  if (!needRefresh) return null;

  return (
    <NotificationBanner
      message="🚀 Nouvelle version disponible. Cliquez ici pour mettre à jour l'application."
      type="warning"
      onClose={() => {
        updateServiceWorker(); // recharge avec la nouvelle version
        close(); // ferme la bannière
      }}
    />
  );
}