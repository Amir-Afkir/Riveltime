import { useEffect, useRef, useState } from "react";
import { calculerTourneeOptimisee } from "../../utils/calculateOptimizedTour";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import BottomSheetTournee from "../../components/ui/BottomSheetTournee";
import useUserStore from "../../stores/userStore";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Tournee() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [livraisons, setLivraisons] = useState([]);
  const [orderedSteps, setOrderedSteps] = useState([]);
  const { token } = useUserStore();

  useEffect(() => {
    const initMapWithRoute = async () => {
      let startingPoint = null;
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        startingPoint = [position.coords.longitude, position.coords.latitude];
        console.log("📍 Position du livreur :", startingPoint);
      } catch (err) {
        console.error("❌ Impossible d'obtenir la position du livreur :", err);
      }

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

      // 2. Extraire les points (boutique + client), supprimer les doublons et limiter à 12 points
      const points = [];
      const pointToCommandeMap = [];
      const seen = new Set();

      for (const commande of orders) {
        const { boutiqueLocation, deliveryLocation } = commande;

        if (boutiqueLocation?.lng != null && boutiqueLocation?.lat != null) {
          const key = `${boutiqueLocation.lng},${boutiqueLocation.lat}`;
          if (!seen.has(key)) {
            points.push([boutiqueLocation.lng, boutiqueLocation.lat]);
            seen.add(key);
          }
          pointToCommandeMap.push({
            type: "pickup",
            commande,
            location: [boutiqueLocation.lng, boutiqueLocation.lat],
          });
        }

        if (deliveryLocation?.lng != null && deliveryLocation?.lat != null) {
          const key = `${deliveryLocation.lng},${deliveryLocation.lat}`;
          if (!seen.has(key)) {
            points.push([deliveryLocation.lng, deliveryLocation.lat]);
            seen.add(key);
          }
          pointToCommandeMap.push({
            type: "delivery",
            commande,
            location: [deliveryLocation.lng, deliveryLocation.lat],
          });
        }
      }

      // ⚠️ Limiter à 12 points
      const limitedPoints = points.slice(0, 12);
      console.log("🔍 Nombre de points :", limitedPoints.length);

      if (limitedPoints.length < 2) return;

      // Préparer une chaîne de coordonnées pour l'API Directions classique
      const coordinates = startingPoint ? [startingPoint, ...limitedPoints] : limitedPoints; // tableau de [lng, lat]
      const coordsString = coordinates.map(coord => coord.join(',')).join(';');
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
      console.log("📌 Points envoyés (Directions):", coordsString);
      console.log("🌐 URL utilisée (Directions):", url);
      const directionsRes = await fetch(url);
      const data = await directionsRes.json();
      console.log("📦 Données Directions:", data);
      if (!data.routes || !data.routes.length) {
        console.error("❌ Mapbox n’a pas renvoyé de route Directions :", data);
        return;
      }
      const route = data.routes[0].geometry;

      // Utilise l'optimiseur pour déterminer l'ordre des commandes
      const commandesOrdonnees = calculerTourneeOptimisee(orders, startingPoint);
      setOrderedSteps(commandesOrdonnees);

      // 3. Tracer la route (avec API Directions)
      if (route) {
        if (!map.current.isStyleLoaded()) {
          map.current.once('load', () => {
            console.log("🧱 Ajout du layer route (Directions)");

            // Nettoyage préalable
            if (map.current.getSource("route")) {
              map.current.removeLayer("route");
              map.current.removeSource("route");
            }

            // Créer un GeoJSON pour la route
            const routeGeoJSON = {
              type: 'Feature',
              properties: {},
              geometry: route,
            };

            map.current.addSource('route', {
              type: 'geojson',
              data: routeGeoJSON,
            });

            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 4,
              },
            });
          });
        } else {
          console.log("🧱 Ajout du layer route (Directions)");

          // Nettoyage préalable
          if (map.current.getSource("route")) {
            map.current.removeLayer("route");
            map.current.removeSource("route");
          }

          // Créer un GeoJSON pour la route
          const routeGeoJSON = {
            type: 'Feature',
            properties: {},
            geometry: route,
          };

          map.current.addSource('route', {
            type: 'geojson',
            data: routeGeoJSON,
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 4,
            },
          });
        }
      }

      // 4. Marqueurs sur chaque point avec couleurs distinctes
      pointToCommandeMap.forEach(({ type, location }) => {
        const color = type === "pickup" ? "#10b981" : "#f59e0b"; // vert pour boutique, orange pour client
        new mapboxgl.Marker({ color }).setLngLat(location).addTo(map.current);
      });
    };

    initMapWithRoute();
  }, [token]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {orderedSteps.length > 0 && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 border border-gray-200 shadow-lg px-4 py-2 rounded-xl text-gray-800 text-sm max-w-[90%] text-center">
          🚚 Tu dois te rendre à :{" "}
          <strong>
            {orderedSteps[0].type === "pickup"
              ? orderedSteps[0].commande.boutiqueAddress
              : orderedSteps[0].commande.deliveryAddress}
          </strong>
        </div>
      )}
      <div
        ref={mapContainer}
        className="absolute top-0 left-0 right-0 bottom-0 w-screen h-screen bg-gray-100 z-0"
      />
      <BottomSheetTournee livraisons={livraisons} orderedSteps={orderedSteps} />
    </div>
  );
}