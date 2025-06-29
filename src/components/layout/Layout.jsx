// ✅ Layout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useUser } from "../../context/UserContext";
import { useMemo, useEffect } from "react";

export default function Layout() {
  const { pathname } = useLocation();
  const { userData } = useUser();

  const getTheme = (path) => {
    if (path.startsWith("/vendeur")) return { color: "green", bodyBg: "#ecfdf5" }; // green-50
    if (path.startsWith("/livreur")) return { color: "orange", bodyBg: "#fff7ed" }; // orange-50
    if (path.startsWith("/client")) return { color: "blue", bodyBg: "#eff6ff" }; // blue-50
    return { color: "rose", bodyBg: "#fff1f2" }; // rose-50
  };

  const { color } = getTheme(pathname);

  useEffect(() => {
    const htmlEl = document.documentElement;
    const themeClass = `theme-${color}`;

    htmlEl.classList.add(themeClass);

    const metaTheme = document.querySelector("meta[name='theme-color']");
    const previousMetaTheme = metaTheme?.getAttribute("content");

    if (metaTheme) {
      const themeColor = color === "green"
        ? "#22c55e"
        : color === "orange"
        ? "#fb923c"
        : color === "blue"
        ? "#3b82f6"
        : "#f43f5e"; // rose par défaut
      metaTheme.setAttribute("content", themeColor);
    }

    return () => {
      htmlEl.classList.remove(themeClass);
      if (metaTheme && previousMetaTheme) {
        metaTheme.setAttribute("content", previousMetaTheme);
      }
    };
  }, [color]);

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
    <div className="min-h-screen pb-28">
      <Header
        title={title}
        showBack={false}
        color={color}
        avatarUrl={avatarUrl}
        showSubtitle={isProfilePage ? userData?.role : null}
      />
      <main className={`${isProfilePage ? "pt-32" : "pt-20"} p-4 max-w-md mx-auto`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}