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
      center: [1.9093, 47.9029], // Orléans
      zoom: 13,
    });

    // Exemple : ajouter un marqueur
    new mapboxgl.Marker()
      .setLngLat([1.9093, 47.9029])
      .setPopup(new mapboxgl.Popup().setHTML("<h3>Boutique ici</h3>"))
      .addTo(map.current);
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