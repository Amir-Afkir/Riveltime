import { useEffect, useState } from "react";
import axios from "axios";
import Section from "../../components/ui/Section";
import Title from "../../components/ui/Title";
import OrderCard from "../../components/logic/OrderCard";
import useUserStore from "../../stores/userStore"; // ✅ store

const getTokenSilentlyFromStore = useUserStore.getState().getTokenSilentlyFn;

export default function CommandesClient() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getTokenSilentlyFromStore();
        if (!token) throw new Error("Token manquant");

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des commandes :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-gray-500 animate-pulse">Chargement des commandes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-[60vh]">
          <Title level={4} className="text-center text-gray-500">
            Aucune commande pour le moment.
          </Title>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}