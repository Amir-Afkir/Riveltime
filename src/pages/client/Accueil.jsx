// src/pages/client/Accueil.jsx
import { useState } from "react";
import useBoutiqueStore from "../../stores/boutiqueStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogIn, ShoppingCart, Bike, Shirt, Laptop, Utensils, Pill, Hammer, Flower } from "lucide-react";
import MerchantCard from "../../components/MerchantCard";

const FILTERS = [
  { name: "Alimentation", icon: <ShoppingCart size={24} />, bg: "#4F9CF9" },
  { name: "Restaurant", icon: <Utensils size={24} />, bg: "#FF7744" },
  { name: "Prêt-à-porter", icon: <Shirt size={24}  />, bg: "#EC4899" },
  { name: "Santé", icon: <Pill size={24} />, bg: "#FF6A7B" },
  { name: "Informatique", icon: <Laptop size={24} />, bg: "#A78BFA" },
  { name: "Mobilité", icon: <Bike size={24} />, bg: "#38D9A9" },
  { name: "Bricolage", icon: <Hammer size={24} />, bg: "#FBBF24" },
  { name: "Jardin", icon: <Flower size={24} />, bg: "#34D399" },
];

export default function Accueil() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { boutiquesClient, loading, error, fetchBoutiquesClient } = useBoutiqueStore();
  useEffect(() => {
    if (!boutiquesClient?.length) fetchBoutiquesClient();
  }, []);
  const navigate = useNavigate();

  const FEATURED_MESSAGES = [
    "Une pépite locale à découvrir absolument",
    "Artisanat passionné, sélection soignée",
    "Ce n’est pas une boutique comme les autres…",
    "Entrez, explorez, régalez-vous",
    "Les clients adorent, vous allez comprendre pourquoi",
    "Rien que pour vous aujourd’hui",
    "Et si vous tombiez sur votre prochain coup de cœur ?",
  ];


  const filteredBoutiques = (boutiquesClient || []).filter((b) => {
    const nom = typeof b.name === "string" ? b.name.toLowerCase() : "";
    const categorie = typeof b.category === "string" ? b.category.toLowerCase() : "";
    const search = query.toLowerCase();
    const categoryFilter = selectedCategory.toLowerCase();

    const matchSearch = nom.includes(search) || categorie.includes(search);
    const matchCategory = categoryFilter ? categorie === categoryFilter : true;

    return matchSearch && matchCategory;
  });

  const randomMessage = FEATURED_MESSAGES[Math.floor(Math.random() * FEATURED_MESSAGES.length)];

  return (
    <>
      {/* Container principal */}
      <div
        className="w-full rounded-t-[2rem] p-4 z-20 relative"
        style={{ minHeight: "100dvh" }}
      >
        <div className="mb-3" aria-hidden="true" />

        {selectedCategory && (
          <div className="flex items-center gap-2 mb-4 ml-2">
            <span className="text-sm text-gray-600">Filtre actif :</span>
            <button
              onClick={() => setSelectedCategory("")}
              className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition"
            >
              <span>{selectedCategory}</span>
              <span className="text-gray-500">✕</span>
            </button>
          </div>
        )}

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
                  onClick={() => setSelectedCategory(name)}
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
              className="relative w-full h-[210px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 cursor-pointer"
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
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-20 p-4 flex flex-col justify-between">
                {/* Top : Pastille fixe "Sélection" */}
                <div className="flex justify-between">
                  <div className="flex items-center gap-1 text-xs text-white px-3 py-1 rounded-full backdrop-blur-md font-semibold bg-white/10 shadow-sm ring-1 ring-white/20">
                    <span className="text-[13px]">👑</span>
                    Sélection
                  </div>
                </div>

                {/* Centre gauche : Nom + Message */}
                <div className="flex-1 flex items-center">
                  <div>
                    <h3 className="text-white text-xl font-bold">{filteredBoutiques[0].name}</h3>
                    <p className="text-white text-sm italic opacity-90 mt-1 animate-fade-in max-w-[90%]">
                      {randomMessage}
                    </p>
                  </div>
                </div>

                {/* Bas gauche : Catégorie + bouton */}
                <div className="flex justify-between items-end">
                  <p className="text-white text-xs italic">
                    À découvrir dans {filteredBoutiques[0].category || "cette catégorie"}
                  </p>
                  <button className="text-white bg-[#ed354f] hover:bg-[#d42e45] text-sm px-4 py-1 rounded-full transition">
                    Voir
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section Populaires */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-1">
            🔥 Les incontournables
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Commerces les plus appréciés par la communauté
          </p>
          <div className="grid grid-cols-2 gap-4">
            {filteredBoutiques.slice(1, 5).map((b) => (
              <MerchantCard
                key={b._id}
                id={b._id}
                name={b.name}
                category={b.category || "Non renseignée"}
                distance={b.distance || null}
                coverImage={b.coverImageUrl || null}
                onClick={() => navigate(`/vitrine/${b._id}`)}
                variant="default"
              />
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
          <div className="flex flex-col gap-4">
            {filteredBoutiques.map((b) => (
              <MerchantCard
                key={b._id}
                id={b._id}
                name={b.name}
                category={b.category || "Non renseignée"}
                distance={b.distance || null}
                coverImage={b.coverImageUrl || null}
                onClick={() => navigate(`/vitrine/${b._id}`)}
                variant="default"
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}