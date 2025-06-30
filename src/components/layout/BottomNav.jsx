// ✅ src/components/BottomNav.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Home, ShoppingCart, Package, User, Store, FileText, Bike, Mail, Scroll } from "lucide-react";

function BottomNavItem({ label, path, icon: Icon, isActive, onClick, color, badge }) {
  return (
    <button
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      aria-label={label}
      className={`group flex flex-col items-center justify-center gap-1 transition-all duration-200 ease-in-out
        ${isActive ? `${color} font-bold` : "text-gray-400 hover:text-gray-600 group-hover:scale-105 group-hover:-translate-y-0.5"} active:scale-95`}
    >
      <div className="relative">
        <Icon className={`transition-transform duration-300 ${isActive ? 'w-7 h-7' : 'w-6 h-6'} group-hover:scale-110`} />
        {badge > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      {isActive && <span className={`mt-1 w-1.5 h-1.5 rounded-full ${color} animate-pulse`} />}
      <span className={`text-xs ${isActive ? 'font-bold' : ''}`}>{label}</span>
    </button>
  );
}

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();

  const totalQuantity = cart?.reduce?.((sum, item) => sum + item.quantity, 0) || 0;

  const path = location.pathname;
  let navItems = [];
  const color = "text-[#ed354f]";

  if (path.startsWith("/client") || path.startsWith("/vitrine")) {
    navItems = [
      { label: "Accueil", path: "/client/accueil", icon: Home },
      { label: "Panier", path: "/client/panier", icon: ShoppingCart },
      { label: "Commandes", path: "/client/commandes", icon: Package },
      { label: "Profil", path: "/client/profil", icon: User },
    ];
  } else if (path.startsWith("/vendeur")) {
    navItems = [
      { label: "Dashboard", path: "/vendeur/dashboard", icon: Store },
      { label: "Produits", path: "/vendeur/produits", icon: Package },
      { label: "Commandes", path: "/vendeur/commandes", icon: FileText },
      { label: "Profil", path: "/vendeur/profil", icon: User },
    ];
  } else if (path.startsWith("/livreur")) {
    navItems = [
      { label: "Dashboard", path: "/livreur/dashboard", icon: Bike },
      { label: "Courses", path: "/livreur/courses", icon: Mail },
      { label: "Historique", path: "/livreur/historique", icon: Scroll },
      { label: "Profil", path: "/livreur/profil", icon: User },
    ];
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md shadow-t-md border-t border-gray-200 rounded-t-2xl">
      <ul className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <BottomNavItem
                label={item.label}
                path={item.path}
                icon={item.icon}
                isActive={isActive}
                color={color}
                badge={item.label === "Panier" ? totalQuantity : 0}
                onClick={() => navigate(item.path)}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}