// src/hooks/useUserCity.js
import { useEffect, useState } from "react";

export default function useUserCity() {
  const [ville, setVille] = useState("Votre ville");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`);
          const data = await res.json();
          const city = data?.features?.[0]?.properties?.city;

          if (city) setVille(city);
        } catch (err) {
          console.error("Erreur reverse geocoding :", err);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.warn("⚠️ Erreur géolocalisation :", error);
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  return { ville, loading };
}