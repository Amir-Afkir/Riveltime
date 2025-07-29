import { useEffect, useRef, useState } from "react";
import { calculerTourneeOptimisee } from "../../utils/calculateOptimizedTour";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import BottomSheetTournee from "../../components/ui/BottomSheetTournee";
import useUserStore from "../../stores/userStore";
import { Phone, PackageIcon, MapPinIcon, LocateIcon, WeightIcon, EuroIcon, Clock } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Tournee() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [livraisons, setLivraisons] = useState([]);
  const [orderedSteps, setOrderedSteps] = useState([]);
  const { token } = useUserStore();

  useEffect(() => {
    const initMapWithRoute = async () => {
      if (!mapContainer.current) {
        console.warn("🛑 mapContainer.current est null !");
        return;
      }
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

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const centerMapOnLivreur = async () => {
    if (!map.current) return;
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const coords = [position.coords.longitude, position.coords.latitude];
      map.current.flyTo({ center: coords, zoom: 14 });
    } catch (err) {
      console.error("❌ Impossible de centrer la carte :", err);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden z-0">
      {orderedSteps.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 mt-12 bg-white/80 backdrop-blur-sm shadow-t-md border-t border-gray-200 rounded-xl p-4 w-[90%] max-w-md shadow-lg border transition-shadow duration-300 hover:shadow-[gray]/40 ">
          <div className="flex items-center gap-4">
            <img
              src={
                orderedSteps[0].type === "pickup"
                  ? orderedSteps[0].commande.boutique?.coverImageUrl
                  : orderedSteps[0].commande.client?.avatarUrl
              }
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover border"
            />
            <div className="flex-1 text-left">
              <p className="text-sm text-gray-500">➡️ Nouvelle direction</p>
              <p className="font-semibold text-gray-800 text-base">
                {orderedSteps[0].type === "pickup"
                  ? orderedSteps[0].commande.boutique?.name
                  : orderedSteps[0].commande.client?.fullname}
              </p>
              <p className="text-sm text-gray-600">
                {orderedSteps[0].type === "pickup"
                  ? orderedSteps[0].commande.boutiqueAddress
                  : orderedSteps[0].commande.deliveryAddress}
              </p>
            </div>
            <a
              href={`tel:${
                orderedSteps[0].type === "pickup"
                  ? orderedSteps[0].commande.boutiqueTelephone
                  : orderedSteps[0].commande.clientTelephone
              }`}
              className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[green]/25 text-green-700 hover:bg-[green]/40"
            >
              <Phone size={18} /> 
            </a>
          </div>
          <div className="mt-3 flex justify-between items-center text-sm text-gray-700">
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-gray-500" />
              <span>{orderedSteps[0].commande.estimatedDelayFormatted || "?"}</span>
            </div>
            <div className="flex items-center gap-1">
              <PackageIcon size={16} className="text-gray-500" />
              <span>{orderedSteps[0].commande.items?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <WeightIcon size={16} className="text-gray-500" />
              <span>{orderedSteps[0].commande.poidsFacture || "?"} kg</span>
            </div>
            <div className="flex items-center gap-1">
              <EuroIcon size={16} className="text-gray-500" />
              <span>{(orderedSteps[0].commande.montantLivreur / 100).toFixed(2)} €</span>
            </div>
          </div>
        </div>
      )}

      <div 
        className="absolute top-0 left-0 right-0 bottom-0 w-screen h-screen bg-gray-100 z-0"
      />
      <div
        ref={mapContainer}
        className="absolute top-0 left-0 w-full h-full z-0"
      />
      <BottomSheetTournee />
      {orderedSteps.length > 0 && (
        <a
          onClick={centerMapOnLivreur}
          className="fixed right-4 w-12 h-12 min-w-[48px] min-h-[48px] bg-white/80 backdrop-blur-sm border-t border-gray-200 text-black rounded-full flex items-center justify-center shadow-lg border transition-shadow duration-300 hover:shadow-[gray]/40"
          style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + 5rem)` }}
        >
          <LocateIcon size={20} />
        </a>
      )}
    </div>

  );
}