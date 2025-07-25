// ✅ src/components/BottomNav.jsx
import { useNavigate, useLocation } from "react-router-dom";
import useCartStore from "../../stores/cartStore";
import { Home, ShoppingCart, Boxes, User, Store, FileText, Bike, RouteIcon, Package } from "lucide-react";
import PanierModal from "../../components/client/PanierModal";
import { useState } from "react";

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
  const cart = useCartStore((state) => state.cart);

  const totalQuantity = cart?.reduce?.((sum, item) => sum + item.quantity, 0) || 0;

  const path = location.pathname;
  let navItems = [];
  const color = "text-[#ed354f]";

  const [isCartOpen, setIsCartOpen] = useState(false);

  if (path.startsWith("/client") || path.startsWith("/vitrine")) {
    navItems = [
      { label: "Accueil", path: "/client/accueil", icon: Home },
      { label: "Panier", path: "#", icon: ShoppingCart, onClick: () => setIsCartOpen(true) },
      { label: "Suivis", path: "/client/commandes", icon: Package },
      { label: "Profil", path: "/client/profil", icon: User },
    ];
  } else if (path.startsWith("/vendeur")) {
    navItems = [
      { label: "Dashboard", path: "/vendeur/dashboard", icon: Store },
      { label: "Inventaire", path: "/vendeur/produits", icon: Boxes },
      { label: "Commandes", path: "/vendeur/commandes", icon: FileText },
      { label: "Profil", path: "/vendeur/profil", icon: User },
    ];
  } else if (path.startsWith("/livreur")) {
    navItems = [
      { label: "Dashboard", path: "/livreur/dashboard", icon: Home },
      { label: "Courses", path: "/livreur/courses", icon: Bike },
      { label: "Tournée", path: "/livreur/tournee", icon: RouteIcon },
      { label: "Profil", path: "/livreur/profil", icon: User },
    ];
  }

  return (
    <>
      {isCartOpen && <PanierModal onClose={() => setIsCartOpen(false)} />}
      <nav className="fixed bottom-0 inset-x-0 z-20 pb-[env(safe-area-inset-bottom)] bg-white/80 backdrop-blur-md shadow-t-md border-t border-gray-200 rounded-t-2xl">  
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
                  onClick={item.onClick || (() => navigate(item.path))}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}