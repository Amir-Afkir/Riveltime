// src/components/BottomNav.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { label: "Accueil", path: "/client", emoji: "🏠" },
    {
      label: "Panier",
      path: "/client/panier",
      emoji: (
        <span className="relative inline-block">
          🛒
          {totalQuantity > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalQuantity}
            </span>
          )}
        </span>
      ),
    },
    { label: "Commandes", path: "/client/commandes", emoji: "📦" },
    { label: "Profil", path: "/client/profil", emoji: "👤" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-gray-200">
      <ul className="flex justify-around text-sm">
        {navItems.map((item) => (
          <li key={item.path}>
            <button
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center px-4 py-2 w-full ${
                location.pathname === item.path ? "text-blue-600 font-semibold" : "text-gray-500"
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}