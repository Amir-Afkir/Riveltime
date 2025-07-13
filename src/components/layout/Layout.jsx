import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useEffect } from "react";

export default function Layout() {
  const { pathname } = useLocation();

  // Détermine le thème couleur & background selon le rôle/page
  const getTheme = () => {
    return { bodyBg: "#f3f4f6" }; // gris clair adapté aux apps mobiles
  };

  const { bodyBg } = getTheme();

  useEffect(() => {
    document.documentElement.style.setProperty("--body-bg", bodyBg);
    return () => {
      document.documentElement.style.removeProperty("--body-bg");
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
    <div className={`min-h-screen ${pathname !== "/" ? "pb-[calc(7rem+env(safe-area-inset-bottom))]" : "pb-0"}`}>
      
      
      {pathname && (
        <div className="fixed inset-0 z-[-10] pointer-events-none">
          <div className="absolute inset-0">
            <div className="h-[0vh] bg-[#ed354f]" />
            <div className="h-[100dvh] bg-[#f3f4f6]" />
          </div>
        </div>
      )}
      
      {pathname && (
        <div
          className={`fixed inset-0 z-[-10] pointer-events-none transition-all ${
            pathname.includes("profil")
              ? "animate-slide-down"
              : pathname !== "/" ? "animate-slide-up-exit" : ""
          }`}
        >
          <div className="absolute inset-0">
            <div className="h-[28vh] bg-[#ed354f]" />
            <div className="h-[72vh] bg-[#f3f4f6]" />
          </div>
        </div>
      )}
      {pathname !== "/" && !pathname.includes("profil") && <Header />}
      <main className={`p-0 max-w-md mx-auto px-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] ${
        pathname !== "/" && !pathname.includes("profil") ? "mt-[48px]" : ""
      }`}>
        <Outlet />
      </main>
      {/* Ne pas afficher BottomNav sur home ("/") */}
      {pathname !== "/" && <BottomNav />}
    </div>
  );
}