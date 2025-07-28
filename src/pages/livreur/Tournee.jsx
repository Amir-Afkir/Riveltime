import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import BottomSheetTournee from "../../components/ui/BottomSheetTournee";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Tournee() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    console.log("🗺️ Initialisation carte Mapbox", mapContainer.current);
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [1.9093, 47.9029],
      zoom: 14,
    });

    let isFirstLocation = true;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("📍 Nouvelle position détectée :", latitude, longitude);

        // Créer ou déplacer le marqueur
        if (!map.current._livreurMarker) {
          map.current._livreurMarker = new mapboxgl.Marker({ color: "blue" })
            .setLngLat([longitude, latitude])
            .addTo(map.current);
          console.log("📌 Marqueur créé");
        } else {
          map.current._livreurMarker.setLngLat([longitude, latitude]);
          console.log("📌 Marqueur mis à jour");
        }

        if (isFirstLocation) {
          map.current.flyTo({ center: [longitude, latitude], zoom: 14 });
          isFirstLocation = false;
        }
      },
      (error) => {
        console.error("❌ Erreur géolocalisation :", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div
        ref={mapContainer}
        className="absolute top-0 left-0 right-0 bottom-0 w-screen h-screen bg-gray-100 z-0"
      />

      {/* Composant glissant par-dessus la carte */}
      <BottomSheetTournee />
    </div>
  );
}