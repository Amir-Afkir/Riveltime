import { useState, useEffect } from "react";
import useUserStore from "../../stores/userStore";
import Title from "../../components/ui/Title";
import Section from "../../components/ui/Section";
import Button from "../../components/ui/Button";

export default function Courses() {
  const [status, setStatus] = useState("en_attente");

  const [orders, setOrders] = useState([]);

  const token = useUserStore(state => state.token);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/orders/livreur/pending`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(console.error);
  }, []);

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

  return (
    <div className="p-4">
        <h1 className="pb-4 font-semibold leading-tight text-black">
          <span className="text-red-600">{orders.length}</span> annonces
        </h1>
      {orders.length === 0 ? (
        <p className="text-gray-500 mt-6">Aucune commande en attente.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white border p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-base">{order.boutiqueNom}</p>
                <p className="text-green-600 font-semibold text-base">{order.totalLivraison.toFixed(2)} €</p>
              </div>
              <div className="text-sm text-gray-700 space-y-1 mb-2">
                <p>• {order.boutiqueAddress}</p>
                <p>• {order.deliveryAddress}</p>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
             <p>{order.estimatedDelayFormatted} ({order.distanceKm} km)</p>
                <span className="border px-2 py-0.5 rounded text-gray-700 text-xs border-gray-300">
                  {order.vehiculeRecommande}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
