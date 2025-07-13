// src/components/Header.jsx
import { useNavigate } from "react-router-dom";
import { LocationEdit } from "lucide-react";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import useUserStore from "../../stores/userStore";
import Button from "../../components/ui/Button";


export default function Header() {
  const navigate = useNavigate();
  const userData = useUserStore((state) => state.userData);
  const adresse = userData?.infosClient?.adresseComplete || userData?.infosVendeur?.adresseComplete || "";
  const ville = adresse?.match(/(?:\d{5})?\s*([\p{L}\s\-']+)$/u)?.[1]?.trim() || "Votre ville";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempAdresse, setTempAdresse] = useState(adresse);
  const [tempName, setTempName] = useState(userData?.fullname || "");
  const [tempPhone, setTempPhone] = useState(userData?.phone || "");
  const updateAdresse = useUserStore((state) => state.updateAdresse);

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
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1"
        >
          <LocationEdit size={16} strokeWidth={2} />
          <span className="font-medium truncate max-w-[100px]">{ville}</span>
          <ChevronDown size={16} />
        </button>
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={(e) => {
            if (e.target.id === "adresse-modal-wrapper") setIsModalOpen(false);
          }}
          id="adresse-modal-wrapper"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-screen-sm md:max-w-screen-md bg-white rounded-t-2xl px-4 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl animate-slide-up max-h-[75vh] overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-800">Modifier vos informations</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Fermer"
                className="p-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5.121 17.804A13.937 13.937 0 0112 15c2.636 0 5.077.76 7.121 2.062M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Nom complet"
              />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 5h2M7 5h10M3 10h18M5 15h14M7 20h10" /></svg>
              <input
                type="tel"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value.replace(/[^\d+ \-]/g, ""))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Téléphone"
              />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 0011.314-11.314l-4.243 4.243z" /></svg>
              <input
                type="text"
                value={tempAdresse}
                onChange={(e) => setTempAdresse(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Adresse complète"
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                const token = localStorage.getItem("accessToken");
                const res = await fetch("https://riveltime.app/api/users/me", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    fullname: tempName,
                    phone: tempPhone,
                    infosClient: { adresseComplete: tempAdresse },
                    infosVendeur: { adresseComplete: tempAdresse },
                  }),
                });
                if (res.ok) {
                  useUserStore.getState().fetchUser({ silent: true });
                  setIsModalOpen(false);
                }
              }}
            >
              Valider
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}