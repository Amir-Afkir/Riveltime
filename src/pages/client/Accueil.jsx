// src/pages/client/Accueil.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import MerchantCard from "../../components/MerchantCard";
import merchants from "../../data/merchants.json";

export default function Accueil() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filteredMerchants = merchants.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* Header fixe */}
      <div
        className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center px-5 bg-transparent"
        style={{
          paddingTop: "env(safe-area-inset-top, 10px)",
          paddingBottom: "env(safe-area-inset-top, 10px)",
        }}
      >
        <img
          src="/icon.svg"
          alt="Riveltime logo"
          className="h-11 w-auto shrink-0 cursor-pointer"
          onClick={() => navigate("/")}
        />
        <button
          className="bg-neutral-50 !text-black border border-gray-300 hover:bg-neutral-100 active:scale-[0.98] active:shadow-inner focus-visible:ring-2 focus-visible:ring-red-300 rounded-full flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium transition-all min-w-[120px]"
          onClick={() => navigate("/connexion")}
          aria-label="Se connecter à son compte"
        >
          Se connecter
        </button>
      </div>

      {/* Container principal avec marge haute pour laisser place au header */}
      <div
        className="bg-[#ffe4e6] w-full rounded-t-[2rem] p-4 mt-[56px] z-20 relative"
        style={{ minHeight: "100vh" }}
      >
        <div className="mb-3" aria-hidden="true" />
        <h1 className="text-xl font-semibold leading-snug text-gray-700 text-center mb-1">
          Bienvenue sur Riveltime
        </h1>
        <p className="text-sm font-normal text-gray-700 text-center max-w-lg mx-auto mb-5">
          Vos commerces locaux, livrés en un clin d'œil.
        </p>
        <div className="relative w-full max-w-md mx-auto mt-4 mb-6">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={20}
          />
          <input
            type="text"
            placeholder="Rechercher un commerçant ou une catégorie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg bg-white py-3 pl-12 pr-4 text-base placeholder:text-gray-400 placeholder:font-medium shadow-md
                       focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1 transition-shadow duration-300"
          />
        </div>

        <div className="grid grid-cols-4 gap-4 my-6">
          {[
            { name: "Alimentation", icon: "🛒" },
            { name: "Mobilité électrique", icon: "🛴" },
            { name: "Prêt-à-porter", icon: "👕" },
            { name: "Informatique", icon: "💻" },
            { name: "Restaurant", icon: "🍽️" },
            { name: "Santé", icon: "💊" },
            { name: "Bricolage", icon: "🧰" },
            { name: "Jardin", icon: "🌸" },
          ].map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => setQuery(name)}
              className="aspect-square min-w-[70px] min-h-[70px] rounded-lg flex flex-col items-center justify-center hover:bg-neutral-200 transition text-center px-2 shadow-md hover:shadow-lg hover:shadow-red-300/50"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-[11px] mt-1">{name}</span>
            </button>
          ))}
        </div>

        <main className="max-w-md mx-auto space-y-5 mt-6">
          {filteredMerchants.map((m) => (
            <MerchantCard
              key={m.id}
              id={m.id}
              name={m.name}
              category={m.category}
              distance={m.distance}
              onClick={() => navigate(`/vitrine/${m.id}`)}
            />
          ))}
        </main>
      </div>
    </>
  );
}