import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import BottomSheetTournee from "../../components/ui/BottomSheetTournee";
import useUserStore from "../../stores/userStore";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Tournee() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [livraisons, setLivraisons] = useState([]);
  const { token } = useUserStore();

  useEffect(() => {
    const initMapWithRoute = async () => {
      if (map.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [1.9093, 47.9029],
        zoom: 13,
      });

      // 1. Récupération des commandes du livreur
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/livreur/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orders = await res.json();
      setLivraisons(orders);

      // 2. Extraire les points (boutique + client) dans l’ordre
      const points = [];
      for (const commande of orders) {
        const { boutiqueLocation, deliveryLocation } = commande;
        if (boutiqueLocation?.lng && boutiqueLocation?.lat) {
          points.push([boutiqueLocation.lng, boutiqueLocation.lat]);
        }
        if (deliveryLocation?.lng && deliveryLocation?.lat) {
          points.push([deliveryLocation.lng, deliveryLocation.lat]);
        }
      }

      if (points.length < 2) return;

      const coordString = points.map(p => `${p[0]},${p[1]}`).join(";");
      const optURL = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordString}?source=first&roundtrip=false&geometries=geojson&access_token=${mapboxgl.accessToken}`;

      const optRes = await fetch(optURL);
      const optData = await optRes.json();
      const route = optData.trips?.[0]?.geometry;

      // 3. Tracer la route
      if (route) {
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: route,
          },
        });

        map.current.addLayer({
          id: "route-layer",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#ff0050",
            "line-width": 5,
          },
        });
      }

      // 4. Marqueurs sur chaque point
      points.forEach(([lon, lat], i) => {
        new mapboxgl.Marker({ color: i === 0 ? "green" : "black" })
          .setLngLat([lon, lat])
          .addTo(map.current);
      });
    };

    initMapWithRoute();
  }, [token]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div
        ref={mapContainer}
        className="absolute top-0 left-0 right-0 bottom-0 w-screen h-screen bg-gray-100 z-0"
      />
      <BottomSheetTournee />
    </div>
  );
}