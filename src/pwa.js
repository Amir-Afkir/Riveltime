// src/pwa.js
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect, useState } from 'react';

export function usePwaUpdater() {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const {
    updateServiceWorker,
  } = useRegisterSW({
    onOfflineReady() {
      setOfflineReady(true);
    },
    onNeedRefresh() {
      setNeedRefresh(true);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return {
    offlineReady,
    needRefresh,
    updateServiceWorker,
    close,
  };
}