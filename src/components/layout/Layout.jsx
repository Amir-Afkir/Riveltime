import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import { useEffect } from "react";

export default function Layout() {
  const { pathname } = useLocation();

  // Détermine le thème couleur & background selon le rôle/page
  const getTheme = () => {
    return { bodyBg: "#ed354f" };
  };

  const { bodyBg } = getTheme();

  useEffect(() => {
    // Sauvegarder les valeurs précédentes pour nettoyage
    const previousColor = document.body.style.backgroundColor;

    // Appliquer couleur de fond au body
    document.body.style.backgroundColor = bodyBg;

    // Nettoyage au démontage / changement thème
    return () => {
      document.body.style.backgroundColor = previousColor;
    };
  }, [bodyBg]);

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
        className="fixed bottom-0 left-0 w-full h-[70vh] z-[-10] bg-[#ffe4e6]"
      />
      <main className="p-0 max-w-md mx-auto">
        <Outlet />
      </main>
      {/* Ne pas afficher BottomNav sur home ("/") */}
      {pathname !== "/" && <BottomNav />}
    </div>
  );
}