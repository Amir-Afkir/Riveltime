import useUserStore from "../../stores/userStore";
import { useEffect, useState } from "react";
import axios from "axios";
import Section from "../../components/ui/Section";
import Title from "../../components/ui/Title";
import OrderCard from "../../components/logic/OrderCard";

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
        <p className="text-gray-500 animate-pulse">Chargement de vos commandes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Title level={4} className="text-gray-500 text-center">
          Vous n’avez passé aucune commande pour le moment.
        </Title>
      </div>
    );
  }

  return (
    <section className="pt-4 px-4">
      <Title level={2}>Mes commandes</Title>
      <div className="space-y-4 mt-4">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </section>
  );
}