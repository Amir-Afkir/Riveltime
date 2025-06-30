import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useUser } from "../../context/UserContext";
import { useMemo, useEffect } from "react";

export default function Layout() {
  const { pathname } = useLocation();
  const { userData } = useUser();
  

  // Détermine le thème couleur & background selon le rôle/page
  const getTheme = () => {
    return { color: "rose", bodyBg: "#ffe4e6" }; // rose-50 de Tailwind
  };

  const { color, bodyBg } = getTheme();

  useEffect(() => {
    // Sauvegarder les valeurs précédentes pour nettoyage
    const previousColor = document.body.style.backgroundColor;

    // Appliquer couleur de fond au body
    document.body.style.backgroundColor = bodyBg;

    // Nettoyage au démontage / changement thème
    return () => {
      document.body.style.backgroundColor = previousColor;
    };
  }, [bodyBg, color]);

  // Détecte si on est sur une page profil (titre + avatar)
  const isProfilePage = ["/client/profil", "/vendeur/profil", "/livreur/profil"].includes(pathname);

  // Définit le titre de la page dans le header
  const title = useMemo(() => {
    if (isProfilePage) return userData?.fullname?.trim() || "Mon profil";

    // Mappage des chemins vers titres
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

  // Détermine URL avatar à passer au header (avec cache bust pour profil)
  const avatarUrl =
    isProfilePage && userData?.avatarUrl?.startsWith("http")
      ? `${userData.avatarUrl}?v=${Date.now()}`
      : "/src/assets/avatar-default.png";

  useEffect(() => {
    const onScroll = () => {
      document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`min-h-screen ${pathname !== "/" ? "pb-28" : "pb-0"}`}>
      <div
        className="fixed top-0 left-0 w-full h-[30vh] z-[-10]"
        style={{
          backgroundColor: "#ed354f",
          transform: "translateY(calc(var(--scroll-y, 0px) * -0.3))",
          transition: "transform 0.1s ease-out",
        }}
      />
      {!isProfilePage && (
        <Header
          title={title}
          showBack={false}
          color={color}
          avatarUrl={avatarUrl}
          showSubtitle={null}
        />
      )}
      <main className="p-0 max-w-md mx-auto">
        <Outlet />
      </main>
      {/* Ne pas afficher BottomNav sur home ("/") */}
      {pathname !== "/" && <BottomNav />}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none bg-white/80 backdrop-blur-md"
        style={{
          height: 'env(safe-area-inset-bottom)',
        }}
      />
    </div>
  );
}