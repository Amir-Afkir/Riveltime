import { ShoppingCart, FileText, Package, Truck, Home, Clock } from "lucide-react";
import useOrderStore from "../../stores/orderStore";
import { useEffect } from "react";
import Title from "../../components/ui/Title";
import Card from "../../components/ui/Card";

export default function CommandesClient() {
  const { orders, loading, error, fetchClientOrders } = useOrderStore();

  useEffect(() => {
    fetchClientOrders();
  }, [fetchClientOrders]);

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
    <section className="pt-4 px-4 pb-10 max-w-2xl mx-auto">
      <Title level={2} className="text-xl mb-6 text-center flex items-center justify-center gap-2">
        <FileText className="w-5 h-5 text-gray-500" /> Historique de commandes
      </Title>
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order._id} className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-base text-gray-600 font-medium flex items-center gap-1">
                <Package className="w-4 h-4" /> Commande n° {order.orderNumber}
              </p>
              <span
                className={`inline-block text-sm font-medium px-2 py-1 rounded-full capitalize ${
                  order.status === "pending"
                    ? "bg-gray-100 text-gray-600"
                    : order.status === "accepted"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "preparing"
                    ? "bg-orange-100 text-orange-800"
                    : order.status === "on_the_way"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : order.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 space-y-1">
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                <ShoppingCart className="w-4 h-4" /> {order.items.length} article{order.items.length > 1 && "s"}
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
                {order.items.map((item) => {
                  const produit = item.product;
                  return (
                    <li key={item._id}>
                      {item.quantity} × {produit?.name || "Produit"}{" "}
                      <span className="ml-1 text-gray-500">
                        ({produit?.price?.toFixed(2)} €)
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="text-right text-base font-semibold text-gray-800 pt-1 border-t border-gray-100 mt-2">
                Total : {order.totalPrice.toFixed(2)} €
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 border-t pt-2">
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-gray-500" /> Livraison : {order.deliveryFee.toFixed(2)} €
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-500" /> Passée le : {new Date(order.placedAt || order.createdAt).toLocaleString()}
              </div>
            </div>

            {order.deliveryAddress && (
              <div className="mt-2 px-2 py-1 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-1 text-sm text-gray-700">
                <Home className="w-4 h-4 text-gray-500 mt-0.5" />
                <p className="leading-normal">{order.deliveryAddress}</p>
              </div>
            )}
            {order.codeVerificationClient && (
              <div className="bg-green-50 border border-green-100 rounded-md px-3 py-2 text-sm text-gray-800 mt-2 flex items-center justify-between">
                <span className="font-semibold">Code de livraison</span>
                <span className="font-mono text-base tracking-wider text-green-800 bg-white border border-green-300 rounded px-2 py-0.5 shadow-sm">
                  {order.codeVerificationClient}
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}