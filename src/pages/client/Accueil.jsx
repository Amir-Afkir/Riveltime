// src/pages/client/Accueil.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MerchantCard from "../../components/MerchantCard";
import merchants from "../../data/merchants.json";
import Input from "../../components/ui/Input";

export default function Accueil() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filteredMerchants = merchants.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-3 gap-4 px-5 mt-3">
        <img
          src="/public/icon.svg"
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
      <div className="bg-[#ffe4e6] w-full rounded-t-[2rem] p-4 mt-2">
        <div className="mb-5" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-gray-900 text-center">Bienvenue sur Riveltime</h1>
        <p className="text-sm text-gray-600 mb-4 text-center">Vos commerces locaux, livrés en un clin d'œil.</p>
        <Input
          type="text"
          placeholder="Rechercher un commerçant ou une catégorie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="placeholder:text-base placeholder:font-medium"
        />

        <div className="grid grid-cols-4 gap-4 my-6">
          {[
            { name: "Alimentation", icon: "🛒" },
            { name: "Mobilité électrique", icon: "🛴" },
            { name: "Prêt-à-porter", icon: "👕" },
            { name: "Informatique", icon: "💻" },
            { name: "Restaurant / Traiteur", icon: "🍽️" },
            { name: "Pharmacie / Santé", icon: "💊" },
            { name: "Bricolage / Maison", icon: "🧰" },
            { name: "Fleuriste / Jardin", icon: "🌸" },
          ].map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => setQuery(name)}
              className="aspect-square bg-neutral-100 rounded-lg flex flex-col items-center justify-center hover:bg-neutral-200 transition text-center px-2"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs mt-1">{name}</span>
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
    </div>
  );
}