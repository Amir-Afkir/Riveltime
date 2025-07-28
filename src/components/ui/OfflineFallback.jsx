// src/components/ui/OfflineFallback.jsx
import { WifiOff } from 'lucide-react';

export default function OfflineFallback() {
  return (
    <div
      className="flex flex-col items-center justify-center h-screen text-center px-6 text-gray-700"
      role="alert"
      aria-live="polite"
    >
      <WifiOff className="w-12 h-12 mb-4 text-gray-500" />
      <h2 className="text-xl font-semibold mb-2">Contenu non disponible hors ligne</h2>
      <p className="text-sm">
        Cette page nécessite une connexion Internet. Veuillez vérifier votre connexion et réessayer.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
      >
        Réessayer
      </button>
    </div>
  );
}