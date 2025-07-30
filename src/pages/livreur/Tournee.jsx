import { useEffect, useRef } from "react";
import { calculerTourneeOptimisee } from "../../utils/calculateOptimizedTour";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import BottomSheetTournee from "../../components/ui/BottomSheetTournee";
import useUserStore from "../../stores/userStore";
import useOrderStore from "../../stores/orderStore";
import { Phone, PackageIcon, MapPinIcon, LocateIcon, WeightIcon, EuroIcon, Clock } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Tournee() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const setMap = useOrderStore(state => state.setMap);
  const { token } = useUserStore();
  const { orders, fetchOrdersAssignedLivreur } = useOrderStore();
  const { orderedSteps, setOrderedSteps, recalculerOrderedSteps, loading } = useOrderStore();

  useEffect(() => {
    const loadMapAndFetch = async () => {
      if (!mapContainer.current) return;

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
      setMap(map.current);

      await fetchOrdersAssignedLivreur(token);
      // Sécurité : recalculer les étapes ordonnées après fetch
      recalculerOrderedSteps();
    };

    loadMapAndFetch();
  }, [token]);

  useEffect(() => {
    if (!map.current || orders.length === 0) return;

    const runRouting = async () => {
      // Spinner start
      setOrderedSteps((prev) => prev); // keep setOrderedSteps in scope for finally
      if (typeof useOrderStore.getState === "function") {
        // (if zustand)
        useOrderStore.setState({ loading: true });
      }
      try {
        const points = [];
        const pointToCommandeMap = [];
        const seen = new Set();

        for (const commande of orders.filter(c =>
            ["accepted", "preparing", "on_the_way"].includes(c.status)
          )) {
          const { boutiqueLocation, deliveryLocation } = commande;

          if (commande.status !== "on_the_way" && boutiqueLocation?.lng != null && boutiqueLocation?.lat != null) {
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

        const limitedPoints = points.slice(0, 12);
        console.log("🔍 Nombre de points :", limitedPoints.length);
        if (limitedPoints.length < 2) return;

        const currentPosition = map.current ? map.current.getCenter().toArray() : null;
        const startingPoint = currentPosition;
        const coordinates = startingPoint ? [startingPoint, ...limitedPoints] : limitedPoints;
        const coordsString = coordinates.map(coord => coord.join(',')).join(';');
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
        const directionsRes = await fetch(url);
        const data = await directionsRes.json();

        if (!data.routes || !data.routes.length) {
          console.error("❌ Mapbox n’a pas renvoyé de route Directions :", data);
          return;
        }

        const route = data.routes[0].geometry;
        const commandesOrdonnees = calculerTourneeOptimisee(orders);
        setOrderedSteps(commandesOrdonnees);

        // Affichage de la route
        if (route) {
          if (map.current.getSource("route")) {
            map.current.removeLayer("route");
            map.current.removeSource("route");
          }
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

        // Fit bounds to route
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord));
        map.current.fitBounds(bounds, { padding: 60 });

        // Marqueurs
        pointToCommandeMap.forEach(({ type, location }) => {
          const color = type === "pickup" ? "#10b981" : "#f59e0b";
          new mapboxgl.Marker({ color }).setLngLat(location).addTo(map.current);
        });
      } finally {
        if (typeof useOrderStore.getState === "function") {
          useOrderStore.setState({ loading: false });
        }
      }
    };

    runRouting();
  }, [orders]);

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
                orderedSteps[0]?.type === "pickup"
                  ? orderedSteps[0]?.commande?.boutique?.coverImageUrl
                  : orderedSteps[0]?.commande?.client?.avatarUrl
              }
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover border"
            />
            <div className="flex-1 text-left">
              <p className="text-sm text-gray-500">➡️ Nouvelle direction</p>
              <p className="font-semibold text-gray-800 text-base">
                {orderedSteps[0]?.type === "pickup"
                  ? orderedSteps[0]?.commande?.boutique?.name
                  : orderedSteps[0]?.commande?.client?.fullname}
              </p>
              <p className="text-sm text-gray-600">
                {orderedSteps[0]?.type === "pickup"
                  ? orderedSteps[0]?.commande?.boutiqueAddress
                  : orderedSteps[0]?.commande?.deliveryAddress}
              </p>
            </div>
            <a
              href={`tel:${
                orderedSteps[0]?.type === "pickup"
                  ? orderedSteps[0]?.commande?.boutiqueTelephone
                  : orderedSteps[0]?.commande?.clientTelephone
              }`}
              className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-green-200 text-green-700 hover:bg-green-300"
            >
              <Phone size={18} /> 
            </a>
          </div>
          <div className="mt-3 flex justify-between items-center text-sm text-gray-700">
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-gray-500" />
              <span>{orderedSteps[0]?.commande?.estimatedDelayFormatted || "?"}</span>
            </div>
            <div className="flex items-center gap-1">
              <PackageIcon size={16} className="text-gray-500" />
              <span>{orderedSteps[0]?.commande?.items?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <WeightIcon size={16} className="text-gray-500" />
              <span>{orderedSteps[0]?.commande?.poidsFacture || "?"} kg</span>
            </div>
            <div className="flex items-center gap-1">
              <EuroIcon size={16} className="text-gray-500" />
              <span>
                {orderedSteps[0]?.commande?.montantLivreur != null
                  ? (orderedSteps[0]?.commande?.montantLivreur / 100).toFixed(2)
                  : "?"} €
              </span>
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
