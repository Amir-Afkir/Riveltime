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
        <div className="relative mb-5 pl-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none"
            size={20}
          />
          <input
            type="text"
            placeholder="Recherchez une boutique"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pr-4 py-2 pl-10 border border-gray-300 rounded-3xl shadow-sm text-base text-gray-800 focus-visible:ring-2 focus-visible:ring-primary focus:border-primary"
          />
        </div> 
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

        {/* Section En vedette */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-1">
            ✨ En vedette
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Notre sélection du moment
          </p>
          {filteredBoutiques[0] && (
            <MerchantCard
              key={filteredBoutiques[0]._id}
              id={filteredBoutiques[0]._id}
              name={filteredBoutiques[0].name}
              category={filteredBoutiques[0].category || "Non renseignée"}
              distance={filteredBoutiques[0].distance || null}
              coverImage={filteredBoutiques[0].coverImageUrl || null}
              onClick={() => navigate(`/vitrine/${filteredBoutiques[0]._id}`)}
            />
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
      </div>
    </>
  );
}