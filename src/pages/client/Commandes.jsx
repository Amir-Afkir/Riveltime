import { ShoppingCart, FileText, Package, Truck, Home, Clock } from "lucide-react";
import useUserStore from "../../stores/userStore";
import { useEffect, useState } from "react";
import axios from "axios";
import Section from "../../components/ui/Section";
import Title from "../../components/ui/Title";

export default function CommandesClient() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, getTokenSilentlyFn } = useUserStore();
  const getToken = getTokenSilentlyFn();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const accessToken = token || (getToken && await getToken());
        if (!accessToken) throw new Error("Aucun token disponible");

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setOrders(res.data);
      } catch (err) {
        console.error("❌ Erreur chargement commandes :", err);
        setError("Une erreur est survenue lors du chargement de vos commandes.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-400 text-base animate-pulse">Chargement en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh] px-4 text-center">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
        <ShoppingCart className="w-8 h-8 text-gray-400 mb-2" />
        <Title level={4} className="text-gray-500">
          Vous n’avez encore passé aucune commande.
        </Title>
      </div>
    );
  }

  return (
    <section className="pt-4 px-4 pb-10 max-w-xl mx-auto">
      <Title level={2} className="text-xl mb-4 text-center flex items-center justify-center gap-2">
        <FileText className="w-5 h-5 text-gray-500" /> Historique de commandes
      </Title>
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="rounded-xl border border-gray-200 p-4 shadow-sm bg-white transition hover:shadow-md"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">
                Commande n° <span className="font-medium text-gray-700">{order.orderNumber}</span>
              </p>
              <span className="text-xs rounded-full px-2 py-1 bg-gray-100 text-gray-700 capitalize">{order.status}</span>
            </div>

            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <Home className="w-4 h-4 text-gray-500" />
              {order.deliveryAddress}
            </p>
            <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              {new Date(order.placedAt || order.createdAt).toLocaleString()}
            </p>

            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <ShoppingCart className="w-4 h-4 text-gray-500" />
                Produits :
              </p>
              {order.items?.length > 0 ? (
                <ul className="space-y-1">
                  {order.items.map((item) => {
                    const produit = item.product;
                    const nomProduit = produit?.name || "Produit inconnu";
                    const prix = typeof produit?.price === "number" ? produit.price.toFixed(2) : "Prix inconnu";

                    return (
                      <li key={produit?._id || item._id} className="text-sm text-gray-600">
                        {nomProduit} <span className="text-gray-400">x{item.quantity}</span> — <span className="font-medium">{prix} €</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm italic text-gray-400">Aucun produit dans cette commande.</p>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-3 mb-1 flex items-center gap-1">
              <Truck className="w-4 h-4 text-gray-500" />
              Livraison : <span className="font-medium">{order.deliveryFee.toFixed(2)} €</span>
            </p>
            <p className="text-sm text-gray-700 flex items-center gap-1">
              <Package className="w-4 h-4 text-gray-500" />
              Total : <span className="font-semibold">{order.totalPrice.toFixed(2)} €</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}