// src/components/Header.jsx
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-5 bg-[#ed354f] shadow-md"
      style={{ paddingTop: "env(safe-area-inset-top)", height: "50px" }}
    >
      <img
        src="/icon.svg"
        alt="Riveltime logo"
        title="Riveltime - Accueil"
        className="h-6 w-auto cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={() => navigate("/")}
      />
      <span className="text-white text-base font-semibold tracking-wide">
        Riveltime
      </span>
    </header>
  );
}
