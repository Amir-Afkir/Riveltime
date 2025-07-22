import { useState, useEffect } from "react";
import { LocateIcon, RouteIcon } from "lucide-react";
import useUserStore from "../../stores/userStore";
import Card from "../../components/ui/Card";

export default function Courses() {
  const token = useUserStore(state => state.token);

  const [orders, setOrders] = useState([]);
  const [filterType, setFilterType] = useState("autour"); // "autour" ou "itineraire"
  const [depart, setDepart] = useState("");
  const [arrivee, setArrivee] = useState("");
  const [departSuggestions, setDepartSuggestions] = useState([]);
  const [adresseSuggestions, setAdresseSuggestions] = useState([]);
  const [coordsDepart, setCoordsDepart] = useState(null);
  const [coordsArrivee, setCoordsArrivee] = useState(null);
  const [coordsAutour, setCoordsAutour] = useState(null);
  const [rayon, setRayon] = useState("5"); // en km, string pour URLSearchParams

  // Fonction pour fetch suggestions d'adresse
  const fetchSuggestions = async (query, setSuggestions) => {
    if (query.length > 3) {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}`);
        const dataAPI = await res.json();
        setSuggestions(dataAPI.features || []);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Effet pour charger les commandes selon filtre et coordonnées
  useEffect(() => {
    const fetchOrders = async () => {
      let url = `${import.meta.env.VITE_API_URL}/orders/livreur/pending`;
      const params = new URLSearchParams();
      const rayonFloat = parseFloat(rayon);
      let useFilter = false;

      if (filterType === "autour") {
        if (coordsAutour?.lat && coordsAutour?.lon && !isNaN(rayonFloat)) {
          params.append("filterType", "autour");
          params.append("lat", coordsAutour.lat);
          params.append("lon", coordsAutour.lon);
          params.append("rayon", rayonFloat);
          useFilter = true;
        }
      } else if (filterType === "itineraire") {
        if (
          coordsDepart?.lat && coordsDepart?.lon &&
          coordsArrivee?.lat && coordsArrivee?.lon &&
          !isNaN(rayonFloat)
        ) {
          params.append("filterType", "itineraire");
          params.append("latDepart", coordsDepart.lat);
          params.append("lonDepart", coordsDepart.lon);
          params.append("latArrivee", coordsArrivee.lat);
          params.append("lonArrivee", coordsArrivee.lon);
          params.append("rayon", rayonFloat);
          useFilter = true;
        }
      }

      if (useFilter && params.toString()) {
        url += `?${params.toString()}`;
      }

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          console.error("Erreur API ou réponse inattendue :", data);
          setOrders([]);
          return;
        }
        setOrders(data);
      } catch (err) {
        console.error("Erreur lors du chargement des commandes :", err);
        setOrders([]);
      }
    };

    fetchOrders();
  }, [coordsAutour, filterType, coordsDepart, coordsArrivee, rayon, token]);

  // Reset des filtres lors du changement de mode
  const handleFilterTypeChange = (newFilterType) => {
    setFilterType(newFilterType);
    setDepart("");
    setArrivee("");
    setDepartSuggestions([]);
    setAdresseSuggestions([]);
    setCoordsDepart(null);
    setCoordsArrivee(null);
    setCoordsAutour(null);
    setRayon("5");
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-black">
          <span className="text-green-600 text-xl">{orders.length}</span>{" "}
          <span className="text-sm font-medium text-gray-700">annonces</span>
        </h1>
        <div className="flex gap-2">
          {filterType === "itineraire" ? (
            <button
              onClick={() => handleFilterTypeChange("autour")}
              className="px-4 py-4 rounded-full border text-sm transition flex items-center gap-2 bg-black text-white"
              aria-label="Filtrer par itinéraire"
            >
              <RouteIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleFilterTypeChange("itineraire")}
              className="px-4 py-4 rounded-full border text-sm transition flex items-center gap-2 bg-white text-gray-700"
              aria-label="Filtrer autour d'une adresse"
            >
              <LocateIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {filterType === "itineraire" ? (
        <div className="flex flex-col sm:flex-row gap-3 mt-3 mb-5 px-1">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <RouteIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Adresse de départ"
              value={depart}
              onChange={(e) => {
                const value = e.target.value;
                setDepart(value);
                fetchSuggestions(value, setDepartSuggestions);
              }}
              className="w-full pl-10 pr-4 py-2 text-[16px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ed354f] bg-white"
              autoComplete="off"
            />
            {departSuggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-auto text-sm">
                {departSuggestions.map((sug) => (
                  <li
                    key={sug.properties.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDepart(sug.properties.label);
                      setDepartSuggestions([]);
                      const [lon, lat] = sug.geometry.coordinates;
                      setCoordsDepart({ lat, lon });
                    }}
                  >
                    {sug.properties.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <RouteIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Adresse d’arrivée"
              value={arrivee}
              onChange={(e) => {
                const value = e.target.value;
                setArrivee(value);
                fetchSuggestions(value, setAdresseSuggestions);
              }}
              className="w-full pl-10 pr-4 py-2 text-[16px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ed354f] bg-white"
              autoComplete="off"
            />
            {adresseSuggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-auto text-sm">
                {adresseSuggestions.map((sug) => (
                  <li
                    key={sug.properties.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setArrivee(sug.properties.label);
                      setAdresseSuggestions([]);
                      const [lon, lat] = sug.geometry.coordinates;
                      setCoordsArrivee({ lat, lon });
                    }}
                  >
                    {sug.properties.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-row flex-nowrap items-center gap-2 mt-3 mb-5 px-1">
          <div className="relative flex-grow">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <LocateIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Adresse autour de..."
              value={arrivee}
              onChange={(e) => {
                const value = e.target.value;
                setArrivee(value);
                fetchSuggestions(value, setAdresseSuggestions);
              }}
              className="w-full pl-10 pr-4 py-2 text-[16px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ed354f] bg-white"
              autoComplete="off"
            />
            {adresseSuggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-auto text-sm">
                {adresseSuggestions.map((sug) => (
                  <li
                    key={sug.properties.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setArrivee(sug.properties.label);
                      setAdresseSuggestions([]);
                      const [lon, lat] = sug.geometry.coordinates;
                      setCoordsAutour({ lat, lon });
                    }}
                  >
                    {sug.properties.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input
            type="number"
            min={1}
            max={30}
            placeholder="Rayon"
            value={rayon}
            onChange={(e) => setRayon(e.target.value.replace(/[^\d.]/g, ""))}
            className="border border-gray-300 rounded-full px-4 py-2 w-20 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#ed354f] bg-white"
          />
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-500 mt-6">Aucune commande en attente.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <Card
              key={order._id}
              title={order.boutiqueNom}
              action={
                <span className="text-green-600 font-bold text-sm">
                  {order.totalLivraison.toFixed(2)} €
                </span>
              }
              delay={index * 80}
            >
              <div>• {order.boutiqueAddress}</div>
              <div>• {order.deliveryAddress}</div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {order.estimatedDelayFormatted} ({order.distanceKm} km)
                </span>
                <span className="border px-3 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border-gray-300">
                  {order.vehiculeRecommande}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}