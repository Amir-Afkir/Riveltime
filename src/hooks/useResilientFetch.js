// src/hooks/useResilientFetch.js
import { useEffect, useState } from "react";

export default function useResilientFetch(url, cacheKey, options = {}) {
  const initialCache = (() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.warn("Erreur parsing initial cache", e);
      return null;
    }
  })();

  const [data, setData] = useState(initialCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error("Erreur réseau");
        const json = await res.json();
        setData(json);
        localStorage.setItem(cacheKey, JSON.stringify(json));
      } catch (err) {
        console.warn("Échec fetch :", err);
        setError(err.message || "Erreur inconnue");
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            setData(JSON.parse(cached));
          } catch (e) {
            console.error("Erreur parsing cache", e);
            setData(null);
          }
        } else {
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url, cacheKey]);

  return { data, loading, error, setData };
}