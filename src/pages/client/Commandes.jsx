import { useCart } from "../../context/CartContext";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function CommandesClient() {
  const { orders } = useCart();

  return (
    <div className="min-h-screen bg-blue-50 pb-20">
      <Header title="Mes commandes" showBack={false} />
      <div className="p-4 max-w-md mx-auto">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500">Aucune commande pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="bg-white p-4 rounded shadow">
                <p className="font-semibold">Commande du {order.date}</p>
                <p className="text-sm text-gray-500">{order.items.length} article(s) – {order.total.toFixed(2)} €</p>
                <ul className="text-xs mt-2 text-gray-600">
                  {order.items.map((item, idx) => (
                    <li key={idx}>{item.quantity}× {item.product.name} chez {item.merchant}</li>
                  ))}
                </ul>
                <span className="text-xs font-medium text-blue-500 mt-2 inline-block">Statut : {order.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <BottomNav />
    </div>
  );
}