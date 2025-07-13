// src/pages/client/Accueil.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogIn, ShoppingCart, Bike, Shirt, Laptop, Utensils, Pill, Hammer, Flower } from "lucide-react";
import MerchantCard from "../../components/MerchantCard";

const FILTERS = [
  { name: "Alimentation", icon: <ShoppingCart size={24} />, bg: "#4F9CF9" },
  { name: "Restaurant", icon: <Utensils size={24} />, bg: "#FF7744" },
  { name: "Santé", icon: <Pill size={24} />, bg: "#FF6A7B" },
  { name: "Mobilité", icon: <Bike size={24} />, bg: "#38D9A9" },
  { name: "Informatique", icon: <Laptop size={24} />, bg: "#A78BFA" },
  { name: "Bricolage", icon: <Hammer size={24} />, bg: "#FBBF24" },
  { name: "Jardin", icon: <Flower size={24} />, bg: "#34D399" },
];

export default function Accueil() {
  const [query, setQuery] = useState("");
  const [boutiques, setBoutiques] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBoutiques() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/client/accueil/boutiques`);
        if (!res.ok) throw new Error("Erreur lors du fetch boutiques");
        const data = await res.json();
        setBoutiques(data);
      } catch (error) {
        console.error("Erreur fetch boutiques", error);
      }
    }
    fetchBoutiques();
  }, []);

  const filteredBoutiques = boutiques.filter((b) => {
    const nom = typeof b.name === "string" ? b.name.toLowerCase() : "";
    const categorie = typeof b.category === "string" ? b.category.toLowerCase() : "";
    const search = query.toLowerCase();
    return nom.includes(search) || categorie.includes(search);
  });

  return (
    <>
      {/* Container principal */}
      <div
        className="w-full rounded-t-[2rem] p-4 z-20 relative"
        style={{ minHeight: "100vh" }}
      >
        <div className="mb-3" aria-hidden="true" />

        {/* Recherche */}
        <div className="relative mb-5 pl-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none"
            size={20}
          />
          <input
            type="text"
            placeholder="Rechercher une boutique..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-[16px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ed354f]"
          />
        </div> 

        {/* Filtres par catégorie */}
        <div className="-mx-4">
          <div className="pl-5 pr-4 flex overflow-x-auto gap-4 py-3 whitespace-nowrap no-scrollbar snap-x scroll-pl-6">
            {FILTERS.map(({ name, icon, bg }) => (
              <div
                key={name}
                className="w-[70px] shrink-0 snap-start flex flex-col items-center justify-center text-center"
              >
                <button
                  onClick={() => setQuery(name)}
                  className="w-[75px] h-[52px] min-h-[44px] rounded-full flex items-center justify-center transition shadow-md hover:shadow-lg hover:brightness-95"
                  style={{ backgroundColor: bg }}
                >
                  <span className="text-white">{icon}</span>
                </button>
                <span
                  className="text-sm mt-1 text-gray-700 leading-tight"
                  title={name}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section Récemment consultées */}
        {(() => {
          try {
            const recent = JSON.parse(localStorage.getItem("recentBoutiques")) || [];
            if (recent.length === 0) return null;

            return (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-1">
                  👀 Récemment consultées
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Vos dernières visites
                </p>
                <div className="flex overflow-x-auto overflow-visible gap-3 py-3 -mx-4 px-4 whitespace-nowrap no-scrollbar snap-x">
                  {recent.map((b, index) => (
                    <div key={b._id || index} className="inline-block w-[260px]">
                      <MerchantCard
                        id={b._id}
                        name={b.name}
                        category={b.category || "Non renseignée"}
                        distance={b.distance || null}
                        coverImage={b.coverImageUrl || null}
                        onClick={() => navigate(`/vitrine/${b._id}`)}
                        variant="recent"
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          } catch (e) {
            return null;
          }
        })()}

        {/* Section En vedette */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-1">
            ✨ En vedette
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Notre sélection du moment
          </p>
          {filteredBoutiques[0] && (
            <div
              className="relative w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/vitrine/${filteredBoutiques[0]._id}`)}
            >
              <div className="absolute inset-0 z-10 pointer-events-none animate-[sparkle_6s_linear_infinite] opacity-30"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 10% 20%, rgba(255,255,255,0.08) 1px, transparent 0),
                    radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 1px, transparent 0),
                    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1.2px, transparent 0)
                  `,
                  backgroundSize: "200px 200px"
                }}
              />
              <img
                src={filteredBoutiques[0].coverImageUrl}
                alt={filteredBoutiques[0].name}
                className="w-full h-[210px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 flex flex-col justify-between z-20">
                <div className="flex justify-end">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.154c.969 0 1.371 1.24.588 1.81l-3.364 2.448a1 1 0 00-.364 1.118l1.287 3.95c.3.921-.755 1.688-1.538 1.118l-3.364-2.448a1 1 0 00-1.176 0l-3.364 2.448c-.783.57-1.838-.197-1.538-1.118l1.287-3.95a1 1 0 00-.364-1.118L2.071 9.377c-.783-.57-.38-1.81.588-1.81h4.154a1 1 0 00.95-.69l1.286-3.95z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <h3 className="text-white text-xl font-bold">{filteredBoutiques[0].name}</h3>
                  <span className="text-white text-xs bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {filteredBoutiques[0].category || "Non renseignée"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section Populaires */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-1">
            🔥 Populaires
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Les commerces préférés des utilisateurs
          </p>
          <div className="flex overflow-x-auto overflow-visible gap-3 py-3 -mx-4 px-4 whitespace-nowrap no-scrollbar snap-x">
            {filteredBoutiques.slice(1, 5).map((b) => (
              <div key={b._id} className="inline-block w-[260px]">
                <MerchantCard
                  id={b._id}
                  name={b.name}
                  category={b.category || "Non renseignée"}
                  distance={b.distance || null}
                  coverImage={b.coverImageUrl || null}
                  onClick={() => navigate(`/vitrine/${b._id}`)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section Toutes les boutiques */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-1">
            🏬 Tous les établissements
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Liste complète des commerces disponibles
          </p>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBoutiques.map((b) => (
              <MerchantCard
                key={b._id}
                id={b._id}
                name={b.name}
                category={b.category || "Non renseignée"}
                distance={b.distance || null}
                coverImage={b.coverImageUrl || null}
                onClick={() => navigate(`/vitrine/${b._id}`)}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}