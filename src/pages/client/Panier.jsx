import { useCart } from "../../context/CartContext";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { useNavigate } from "react-router-dom"; // ← import

export default function Panier() {
  const { cart, removeFromCart, placeOrder } = useCart();
  const navigate = useNavigate(); // ← hook

  const totalArticles = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  const handleOrder = () => {
    placeOrder();
    navigate("/client/commandes"); // ← redirection automatique
  };

  return (
    <div className="min-h-screen bg-blue-50 pb-28">
      <Header title="Votre panier" showBack={false} cartCount={totalArticles} />


      <div className="p-4 max-w-md mx-auto">
        {cart.length === 0 ? (
          <p className="text-center text-gray-500">Votre panier est vide.</p>
        ) : (
          <>
            <ul className="space-y-2 mb-6">
              {cart.map((item, index) => (
                <li key={index} className="bg-white p-3 rounded shadow text-gray-700 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.quantity} × {item.product.name}</span>
                    <br />
                    <small className="text-gray-500">chez {item.merchant}</small>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{(item.product.price * item.quantity).toFixed(2)} €</span>
                    <button
                      onClick={() => removeFromCart(item)}
                      className="text-white bg-red-500 p-1 rounded"
                      aria-label="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="bg-white p-4 rounded shadow text-gray-800">
              <div className="flex justify-between mb-4">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
              <button
                onClick={handleOrder}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Commander
              </button>
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}