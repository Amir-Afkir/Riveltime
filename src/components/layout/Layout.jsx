// ✅ Layout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useUser } from "../../context/UserContext";
import { useMemo } from "react";

export default function Layout() {
  const { pathname } = useLocation();
  const { userData } = useUser();

  const getTheme = (path) => {
    if (path.startsWith("/vendeur")) return { color: "green", bgColor: "bg-green-50" };
    if (path.startsWith("/livreur")) return { color: "orange", bgColor: "bg-orange-50" };
    return { color: "blue", bgColor: "bg-blue-50" };
  };

  const { color, bgColor } = getTheme(pathname);

  const isProfilePage = ["/client/profil", "/vendeur/profil", "/livreur/profil"].includes(pathname);

  const title = useMemo(() => {
    if (isProfilePage) return userData?.fullname?.trim() || "Mon profil";

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
      if (pathname.startsWith(prefix)) return label;
    }

    return pathname === "/" ? "Accueil" : "Riveltime";
  }, [pathname, userData]);

    const avatarUrl =
    isProfilePage && userData?.avatarUrl?.startsWith("http")
      ? `${userData.avatarUrl}?v=${Date.now()}`
      : "/src/assets/avatar-default.png";

  return (
    <div className={`min-h-screen pb-28 ${bgColor}`}>
      <Header
        title={title}
        showBack={false}
        color={color}
        avatarUrl={avatarUrl}
        showSubtitle={isProfilePage ? userData?.role : null}
      />
      <main className={`${isProfilePage ? "pt-28" : "pt-20"} p-4 max-w-md mx-auto`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}