// src/components/Header.jsx
import { useNavigate } from "react-router-dom";
import { LocationEdit } from "lucide-react";
import { useUser } from "../../context/UserContext";

export default function Header() {
  const navigate = useNavigate();
  const { userData } = useUser();
  const adresse = userData?.infosClient?.adresseComplete || userData?.infosVendeur?.adresseComplete || "";
  const ville = adresse?.match(/(?:\d{5})?\s*([\p{L}\s\-']+)$/u)?.[1]?.trim() || "Votre ville";

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
            <div className="flex items-center gap-1">
              <LocationEdit size={16} strokeWidth={2} />
              <span className="font-medium">{ville}</span>
            </div>
          </div>
    </header>
  );
}