import Section from "../../components/ui/Section";
import { useCart } from "../../context/CartContext";
import Header from "../../components/layout/Header";
import BottomNav from "../../components/layout/BottomNav";
import Title from "../../components/ui/Title";
import OrderCard from "../../components/logic/OrderCard"; 

export default function CommandesClient() {
  const { orders } = useCart();

  return (
    <div className="min-h-screen bg-blue-50 pb-20">
      <Header title="Mes commandes" showBack={false} />
      <div className="p-4 max-w-md mx-auto">
        {orders.length === 0 ? (
          <Title level={4} className="text-center text-gray-500">
            Aucune commande pour le moment.
          </Title>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}