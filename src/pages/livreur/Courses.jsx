import { useState, useEffect } from "react";
import { LocateIcon, RouteIcon } from "lucide-react";
import useUserStore from "../../stores/userStore";
import Title from "../../components/ui/Title";
import Section from "../../components/ui/Section";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function Courses() {
  const [status, setStatus] = useState("en_attente");

  const [orders, setOrders] = useState([]);

  const token = useUserStore(state => state.token);

  const [filterType, setFilterType] = useState("autour"); // "autour" ou "itineraire"
  const [depart, setDepart] = useState("");
  const [arrivee, setArrivee] = useState("");
  const [rayon, setRayon] = useState(5); // en km

  useEffect(() => {
    let url = `${import.meta.env.VITE_API_URL}/orders/livreur/pending`;
    const params = new URLSearchParams();

    if (filterType === "itineraire" && depart && arrivee) {
      params.append("depart", depart);
      params.append("arrivee", arrivee);
    } else if (filterType === "autour" && arrivee) {
      params.append("autour", arrivee);
      params.append("rayon", rayon);
    }

    if (params.toString()) url += `?${params.toString()}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(console.error);
  }, [filterType, depart, arrivee, rayon, token]);

  const nextStatus = {
    en_attente: "en_cours",
    en_cours: "presque",
    presque: "terminee",
    terminee: "terminee",
  };

  const statusLabels = {
    en_attente: "En attente de confirmation",
    en_cours: "Commande à récupérer",
    presque: "En route pour la livraison",
    terminee: "Commande livrée",
  };

  const handleAdvance = () => {
    setStatus(nextStatus[status]);
  };

  const handleFilterChange = (e) => setFilterType(e.target.value);

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
              onClick={() => setFilterType("autour")}
              className="px-4 py-2 rounded-full border text-sm transition flex items-center gap-2 bg-black text-white"
              aria-label="Filtrer par itinéraire"
            >
              <RouteIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setFilterType("itineraire")}
              className="px-4 py-2 rounded-full border text-sm transition flex items-center gap-2 bg-white text-gray-700"
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
              <LocateIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Adresse de départ"
              value={depart}
              onChange={(e) => setDepart(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-[15px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ed354f] bg-white"
            />
          </div>
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <LocateIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Adresse d’arrivée"
              value={arrivee}
              onChange={(e) => setArrivee(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-[15px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ed354f] bg-white"
            />
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
              onChange={(e) => setArrivee(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-[15px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ed354f] bg-white"
            />
          </div>
          <input
            type="number"
            min={1}
            max={30}
            placeholder="Rayon"
            value={rayon}
            onChange={(e) => setRayon(e.target.value)}
            className="border border-gray-300 rounded-full px-4 py-2 w-20 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#ed354f] bg-white"
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
