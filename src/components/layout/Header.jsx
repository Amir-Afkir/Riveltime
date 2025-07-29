// src/components/Header.jsx
import { useNavigate } from "react-router-dom";
import { LocationEdit } from "lucide-react";
import { ChevronDown } from "lucide-react";
import useUserStore from "../../stores/userStore";
import useUserCity from "../../hooks/useUserCity";


export default function Header() {
  const navigate = useNavigate();
  const userData = useUserStore((state) => state.userData);
  const adresse = userData?.infosClient?.adresseComplete || userData?.infosVendeur?.adresseComplete || "";
  const { role } = userData || {};
  const { ville: geoVille } = useUserCity();
  let ville = "Votre ville";
  if (role === "livreur") {
    ville = geoVille;
  } else if (typeof adresse === "string") {
    const match = adresse.match(/(?:\d{5})?\s*([\p{L}\s\-']+)$/u);
    ville = match?.[1]?.trim() || "Votre ville";
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 bg-[#ed354f] shadow-md"
      style={{ paddingTop: "env(safe-area-inset-top)", height: "48px" }}
    >
      <div className="flex items-center gap-2">
        <img
          src="/icon.svg"
          alt="Riveltime logo"
          title="Riveltime - Accueil"
          className="h-5 w-auto cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => navigate("/")}
        />
        <span className="text-white text-base font-semibold tracking-wide">
          Riveltime
        </span>
      </div>
      <div className="flex flex-col items-end text-white text-sm">
        <span className="text-xs opacity-80">Localisation</span>
        <button
          className="flex items-center gap-1"
        >
          <LocationEdit size={16} strokeWidth={2} />
          <span className="font-medium truncate max-w-[100px]">{ville}</span>
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}