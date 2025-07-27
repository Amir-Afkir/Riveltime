import { useEffect, useState } from "react";
import axios from "axios";
import useUserStore from "../../stores/userStore";
import Button from "../../components/ui/Button";
import Title from "../../components/ui/Title";
import Card from "../../components/ui/Card";

import { 
  MapPinIcon, 
  PackageIcon, 
  Box,
  Phone, 
} from "lucide-react";

export default function CommandesBoutique() {
  const [selectedStatus, setSelectedStatus] = useState("accepted");
  const STATUSES = {
    accepted: "En attente",
    preparing: "Préparée",
    delivered: "Livrée",
    cancelled: "Annulée",
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useUserStore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/boutique/statut`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Erreur récupération commandes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const handleMarkAsPreparing = async (orderId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/orders/${orderId}/preparing`, {
        status: "preparing"
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "preparing" } : o))
      );
    } catch (err) {
      alert("Erreur mise à jour du statut");
      console.error(err);
    }
  };

  // Exemple de fonction pour marquer comme livrée avec code de vérification
  const handleMarkAsDelivered = async (orderId, code) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/orders/${orderId}/mark-delivered`, {
        code
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Commande marquée comme livrée !");
    } catch (err) {
      alert("Erreur lors de la livraison : " + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      alert("Erreur lors de l'annulation de la commande");
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Chargement des commandes...</p>;

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <div className="mb-4 overflow-x-auto whitespace-nowrap no-scrollbar flex gap-2 px-1">
        {Object.keys(STATUSES).map((statusKey) => (
          <button
            key={statusKey}
            onClick={() => setSelectedStatus(statusKey)}
            className={`px-4 py-1.5 rounded-full border text-sm ${
              selectedStatus === statusKey
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {STATUSES[statusKey]}
          </button>
        ))}
      </div>
      {orders.filter((order) => order.status === selectedStatus).length === 0 ? (
        <Card className="text-center py-8 px-4 bg-white">
          {selectedStatus === "accepted" && (
            <>
              <Title level={3}>Aucune commande en attente</Title>
              <p className="text-sm text-gray-500 mb-4">
                Les commandes apparaîtront ici dès qu’un client aura passé commande.
              </p>
              <div className="flex justify-center mb-4">
                <img src="/boxe-vide.webp" alt="Aucune commande" className="w-32 h-auto opacity-80" />
              </div>
            </>
          )}
          {selectedStatus === "preparing" && (
            <>
              <Title level={3}>Aucune commande préparée</Title>
              <p className="text-sm text-gray-500 mb-4">Vous n’avez encore marqué aucune commande comme étant en préparation.</p>
              <div className="flex justify-center mb-4">
                <img src="/boxe-vide.webp" alt="Aucune commande" className="w-32 h-auto opacity-80" />
              </div>
            </>
          )}
          {selectedStatus === "delivered" && (
            <>
              <Title level={3}>Aucune commande livrée</Title>
              <p className="text-sm text-gray-500 mb-4">Aucune commande n’a encore été marquée comme livrée.</p>
              <div className="flex justify-center mb-4">
                <img src="/boxe-vide.webp" alt="Aucune commande" className="w-32 h-auto opacity-80" />
              </div>
            </>
          )}
          {selectedStatus === "cancelled" && (
            <>
              <Title level={3}>Aucune commande annulée</Title>
              <p className="text-sm text-gray-500 mb-4">Vous n’avez annulé aucune commande récemment.</p>
              <div className="flex justify-center mb-4">
                <img src="/boxe-vide.webp" alt="Aucune commande" className="w-32 h-auto opacity-80" />
              </div>
            </>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {orders
            .filter((order) => order.status === selectedStatus)
            .map((order) => (
            <Card key={order._id} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-600 font-medium flex items-center gap-1"><PackageIcon size={14} />Commande n° {order.orderNumber}</p>
                <span className="inline-block text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {STATUSES[order.status] || "Statut inconnu"}
                </span>
              </div>

              <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 space-y-1">
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
                  <Box size={14} /> {order.items.length} article{order.items.length > 1 && "s"}
                </div>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                  {order.items.map((item) => (
                    <li key={item._id}>
                      {item.quantity} × {item.product?.name || "Produit"} 
                      <span className="ml-1 text-gray-500">
                        ({item.product?.price?.toFixed(2)} €)
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="text-right text-sm font-semibold text-gray-800 pt-1 border-t border-yellow-100 mt-2">
                  Total : {(order.montantVendeur / 100)?.toFixed(2)} €
                </div>
              </div>
              

              {(order.deliverer || order.client) && (
                <div className="border-t pt-2 grid grid-cols-2 gap-2">
                  {order.deliverer && (
                    <div>
                      <p className="text-xs font-semibold text-gray-800 mb-1">Livreur</p>
                      <div className="flex items-start gap-2">
                        {order.deliverer.avatarUrl && (
                          <img
                            src={order.deliverer.avatarUrl}
                            alt={`Avatar de ${order.deliverer.fullname}`}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                        )}
                        <div className="text-xs text-gray-700">
                          <p className="truncate">{order.deliverer.fullname}</p>
                          <a href={`tel:${order.deliverer.phone}`} className="text-blue-600 underline flex items-center gap-1 truncate">
                            <Phone size={12} /> {order.deliverer.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.client && (
                    <div>
                      <p className="text-xs font-semibold text-gray-800 mb-1">Client</p>
                      <div className="flex items-start gap-2">
                        {order.client?.avatarUrl && (
                          <img
                            src={order.client?.avatarUrl}
                            alt={`Avatar de ${order.clientNom}`}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                        )}
                        <div className="text-xs text-gray-700">
                          <p className="truncate">{order.clientNom}</p>
                          <p className="flex items-center gap-1 truncate">
                            <Phone size={12} /> {order.boutiqueTelephone || order.clientTelephone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {order.deliveryAddress && (
                <div className="mt-2 px-2 py-1 bg-gray-50 rounded-md border flex items-start gap-1 text-xs text-gray-700">
                  <MapPinIcon size={12} className="mt-0.5 text-gray-500" />
                  <p className="leading-snug">{order.deliveryAddress}</p>
                </div>
              )}

              {order.status === "accepted" && (
                <div className="flex gap-3 mt-2 justify-between">
                  <Button onClick={() => handleCancelOrder(order._id)} variant="primary" className="w-1/3">
                    Annuler
                  </Button>
                  <Button
                    onClick={() => handleMarkAsPreparing(order._id)}
                    variant="secondary"
                    className="w-2/3"
                  >
                    En préparation
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}