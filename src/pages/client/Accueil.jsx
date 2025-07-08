// src/pages/client/Accueil.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogIn } from "lucide-react";
import MerchantCard from "../../components/MerchantCard";

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
        className="w-full rounded-t-[2rem] p-4 mt-[56px] z-20 relative"
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

        <div className="flex overflow-x-auto gap-3 my-6 px-1 whitespace-nowrap no-scrollbar">
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
            <div className="aspect-square w-[72px] shrink-0 mb-4" key={name}>
              <button
                onClick={() => setQuery(name)}
                className="w-full h-full rounded-lg flex flex-col items-center justify-center hover:bg-neutral-200 transition text-center px-2 shadow-md hover:shadow-lg hover:shadow-red-300/50"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
              >
                <span className="text-xl">{icon}</span>
                <span
                  className="text-[10px] leading-tight text-center mt-1 w-full truncate block"
                  title={name}
                >
                  {name}
                </span>
              </button>
            </div>
          ))}
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
          <div className="overflow-x-auto whitespace-nowrap px-1 space-x-4 flex">
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