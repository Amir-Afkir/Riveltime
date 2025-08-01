// src/pages/client/Accueil.jsx
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import haversine from 'haversine-distance';
import useBoutiqueStore from "../../stores/boutiqueStore";
import { useNavigate } from "react-router-dom";
import { Search, Earth, ShoppingCart, Bike, Shirt, Laptop, Utensils, Pill, Hammer, Flower, ChevronDown, Clock3, Flame, Truck } from "lucide-react";
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
  const [boutiquesAvecDistance, setBoutiquesAvecDistance] = useState([]);
  const [filtreDistance, setFiltreDistance] = useState(null);
  const [showDistanceFilters, setShowDistanceFilters] = useState(false);
  const { boutiquesClient, loading, error, fetchBoutiquesClient, boutiquesAutour, fetchBoutiquesAutour } = useBoutiqueStore();

  const distanceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (distanceRef.current && !distanceRef.current.contains(event.target)) {
        setShowDistanceFilters(false);
      }
    };

    if (showDistanceFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDistanceFilters]);
  useEffect(() => {
    if (!boutiquesClient?.length) fetchBoutiquesClient();
  }, []);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        const boutiques = boutiquesClient || [];
        const boutiquesAvecDist = boutiques.map((b) => {
          if (b.location?.coordinates?.length === 2) {
            const [lon, lat] = b.location.coordinates;
            const distance = haversine(
              { lat: latitude, lon: longitude },
              { lat, lon }
            ) / 1000;
            return { ...b, distanceKm: distance };
          }
          return b;
        });
        setBoutiquesAvecDistance(boutiquesAvecDist);
      },
      (err) => console.warn("Erreur géoloc", err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [boutiquesClient]);
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


  const filteredBoutiques = (boutiquesAvecDistance || []).filter((b) => {
    const nom = typeof b.name === "string" ? b.name.toLowerCase() : "";
    const categorie = typeof b.category === "string" ? b.category.toLowerCase() : "";
    const search = query.toLowerCase();
    const categoryFilter = selectedCategory.toLowerCase();

    const matchSearch = nom.includes(search) || categorie.includes(search);
    const matchCategory = categoryFilter ? categorie === categoryFilter : true;
    const matchDistance = filtreDistance ? b.distanceKm <= filtreDistance : true;

    return matchSearch && matchCategory && matchDistance;
  });

  const randomMessage = FEATURED_MESSAGES[Math.floor(Math.random() * FEATURED_MESSAGES.length)];

  // Promotion de produit aléatoire
  const allProducts = boutiquesAvecDistance.flatMap(b => b.products?.map(p => ({ ...p, boutiqueId: b._id })) || []);
  const randomProduct = allProducts.length
    ? allProducts[Math.floor(Math.random() * allProducts.length)]
    : null;

  return (
    <>
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
      {/* Container principal */}
      <div
        className="w-full rounded-t-[2rem] p-4 z-20 relative"
        style={{ minHeight: "100dvh" }}
      >
        <div className="mb-3" aria-hidden="true" />

        {(selectedCategory || filtreDistance) && (
          <div className="flex items-center gap-2 mb-4 ml-2 flex-wrap">
            <span className="text-sm text-gray-600">Filtres actifs :</span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition"
              >
                <span>{selectedCategory}</span>
                <span className="text-gray-500">✕</span>
              </button>
            )}
            {filtreDistance && (
              <button
                onClick={() => setFiltreDistance(null)}
                className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition"
              >
                <span>≤ {filtreDistance} km</span>
                <span className="text-gray-500">✕</span>
              </button>
            )}
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

        {/* Bloc météo */}
        <div className="mt-4 mb-2 bg-blue-100 border border-blue-200 rounded-xl px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-blue-900">👋 Il fait beau aujourd’hui</p>
          <p className="text-sm text-blue-800">C’est le moment de commander local !</p>
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

        {/* Section En vedette */}
        <section className="mt-4">
          {filteredBoutiques[0] && (
            <div
              className="relative w-full h-[210px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 cursor-pointer animate-fade-in-up"
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

        {/* Filtres contextuels + Distance */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button className="flex items-center gap-1 bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm text-gray-800 hover:bg-gray-100 h-[44px]">
            <Clock3 size={16} className="text-gray-500" />
            Ouvert maintenant
          </button>
          <button className="flex items-center gap-1 bg-orange-500 border rounded-full px-4 py-1.5 text-sm text-white hover:bg-orange-600 h-[44px]">
            <Flame size={16} className="text-[yellow]" />
            Offres
          </button>
          <button className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-3 py-1.5 hover:bg-gray-100 h-[44px]">
            <Truck size={20} className="text-gray-500" />
            <div className="flex flex-col leading-tight text-left">
              <span className="text-[12px] text-gray-800">Livraison</span>
              <span className="text-[12px] text-gray-800 font-semibold">gratuite</span>
            </div>
          </button>

          <div
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition cursor-pointer h-[44px]"
            onClick={() => setShowDistanceFilters(prev => !prev)}
          >
            <span className="text-sm font-medium text-gray-800">À proximité</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-700 transition-transform duration-300 ${showDistanceFilters ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        <div className="relative" ref={distanceRef}>
          <div
            className={`absolute z-30  -mx-4 left-0 right-0  transition-all duration-300 ${
              showDistanceFilters ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="flex overflow-x-auto gap-3 py-2 px-4 whitespace-nowrap no-scrollbar scroll-pl-6 snap-x">
              {[3, 7, 15, 25, 50, 100, 200, 500].map((km) => (
                <button
                  key={km}
                  onClick={() => setFiltreDistance(km)}
                  className={`px-3 py-1.5 rounded-full text-sm shrink-0 snap-start transition border ${
                    filtreDistance === km
                      ? "bg-[#ed354f] text-white border-[#ed354f]"
                      : "bg-white text-gray-700 shadow-md border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  ≤ {km} km
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Section Récemment consultées */}
        {(() => {
          try {
            const recent = JSON.parse(localStorage.getItem("recentBoutiques")) || [];
            if (recent.length === 0) return null;

            return (
              <section className="mt-8">
                <h2 className="text-lg font-bold text-gray-900">
                  👁️‍🗨️ Vos visites récentes
                </h2>
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

        {randomProduct && (
          <div className="relative group mt-6 px-4 py-4 rounded-2xl bg-gradient-to-r from-blue-100 to-blue-50 shadow-md flex items-center gap-4 overflow-hidden border border-blue-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="w-28 h-28 bg-white rounded-2xl overflow-hidden border border-white shadow-md relative">
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl z-10" />
              <img
                src={randomProduct.imageUrl}
                alt={randomProduct.name}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between h-full py-1">
              <div>
                <p className="text-sm font-bold text-blue-900 truncate">
                  🛍️ {randomProduct.name}
                </p>
                <p className="text-[13px] text-blue-800 mt-1">
                  💥 Coup de cœur en promo sur Riveltime
                </p>
              </div>
              <button
                onClick={() => navigate(`/vitrine/${randomProduct.boutiqueId}`)}
                className="self-start bg-[#ed354f] hover:bg-[#d42e45] text-white text-xs font-semibold px-4 py-1.5 mt-4 rounded-full shadow-sm transition-all group-hover:scale-105"
              >
                Découvrir
              </button>
            </div>
            <div className="absolute top-0 right-0 px-2 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-bl-xl tracking-wide">
              ⚡ Offre
            </div>
          </div>
        )}

        {/* Section Populaires */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-gray-900">🔥 Best-sellers locaux</h2>
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
          <h2 className="text-lg font-bold text-gray-900">🏪 Tous les commerces</h2>
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