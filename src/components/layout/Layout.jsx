import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useUser } from "../../context/UserContext";
import { useMemo } from "react";

export default function Layout() {
  const location = useLocation();
  const { userData } = useUser();

  const getColor = (path) =>
    path.startsWith("/vendeur") ? "green" :
    path.startsWith("/livreur") ? "orange" : "blue";

  const color = getColor(location.pathname);
  const path = location.pathname;

  const bgColor = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
  }[color] || "bg-gray-50";

  const title = useMemo(() => {
    if (["/client/profil", "/vendeur/profil", "/livreur/profil"].some(p => path.startsWith(p))) {
      return userData?.fullname?.trim() || "Mon profil";
    }

    const rules = [
      ["/client/accueil", "Accueil"],
      ["/client/panier", "Mon panier"],
      ["/client/commandes", "Commandes"],
      ["/client/messages", "Messages"],
      ["/vitrine/", "Vitrine"],
      ["/vendeur/dashboard", "Tableau de bord"],
      ["/vendeur/produits", "Mes produits"],
      ["/vendeur/commandes", "Commandes"],
      ["/vendeur/messages", "Messages"],
      ["/livreur/dashboard", "Tableau de bord"],
      ["/livreur/courses", "Courses"],
      ["/livreur/historique", "Historique"],
      ["/livreur/messages", "Messages"],
    ];

    for (const [prefix, label] of rules) {
      if (path.startsWith(prefix)) return label;
    }

    return path === "/" ? "Accueil" : "Riveltime";
  }, [path, userData]);

  // Avatar visible uniquement sur la page profil
  const showAvatar = ["/client/profil", "/vendeur/profil", "/livreur/profil"].includes(path);

  return (
    <div className={`min-h-screen pb-28 ${bgColor}`}>
      <Header
        title={title}
        showBack={false}
        color={color}
        avatarUrl={showAvatar && userData?.avatarUrl ? userData.avatarUrl : "/src/assets/avatar-default.png"}
        showSubtitle={showAvatar ? userData?.role : null}
      />
      <main className="p-4 max-w-md mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}