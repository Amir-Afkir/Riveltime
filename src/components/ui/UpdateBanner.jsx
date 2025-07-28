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
      // Tu peux afficher un toast ici avec react-hot-toast ou autre
    }
  }, [offlineReady]);

  if (!needRefresh) return null;

  return (
    <NotificationBanner
      message="🚀 Nouvelle version disponible. Cliquez ici pour mettre à jour."
      type="warning"
      onClose={() => {
        updateServiceWorker(); // recharge avec la nouvelle version
        close(); // ferme la bannière
      }}
    />
  );
}