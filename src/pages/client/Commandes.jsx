import Section from "../../components/ui/Section";
import { useCart } from "../../context/CartContext";
import Title from "../../components/ui/Title";
import OrderCard from "../../components/logic/OrderCard"; 

export default function CommandesClient() {
  const { orders } = useCart();

  return (
    <div className="space-y-4">
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
    </div>
  );
}