// src/hooks/useResilientFetch.js
import { useEffect, useState } from "react";

export default function useResilientFetch(url, cacheKey, options = {}) {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Erreur réseau");
        const data = await res.json();
        setData(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (err) {
        console.warn("Échec fetch :", err);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            setData(JSON.parse(cached));
          } catch (e) {
            console.error("Erreur parsing cache", e);
            setData(null); // ou []
          }
        } else {
          setData(null); // ou []
        }
      }
    }

    fetchData();
  }, [url, cacheKey]);

  return data;
}