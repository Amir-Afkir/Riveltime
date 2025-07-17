// src/pages/client/Vitrine.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useUserStore from "../../stores/userStore";
import useCartStore from "../../stores/cartStore";
import Button from "../../components/ui/Button";
import Title from "../../components/ui/Title";
import Card from "../../components/ui/Card";
import NotificationBanner from "../../components/ui/NotificationBanner";
import { ShoppingCart, List, LayoutGrid, Search, MapPin, Clock, Euro, Star } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function formatDelay(minutes) {
  if (minutes >= 1440) {
    const days = Math.floor(minutes / 1440);
    return `${days} jour${days > 1 ? "s" : ""}`;
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  }
  return `${minutes} min`;
}

export default function Vitrine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);
  const totalQuantity = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const [boutique, setBoutique] = useState(null);
  const [produits, setProduits] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("tout");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const closeNotification = () => setNotification(null);

  const { token, userData } = useUserStore();
  const [estimatedFee, setEstimatedFee] = useState(null);
  const [estimatedDelay, setEstimatedDelay] = useState(null);

  useEffect(() => {
    async function fetchBoutiqueAndProduits() {
      try {
        const resBoutique = await fetch(`${API_URL}/boutiques/${id}`);
        if (!resBoutique.ok) throw new Error("Boutique introuvable");
        const { boutique } = await resBoutique.json();

        const resProduits = await fetch(`${API_URL}/boutiques/${id}/produits`);
        if (!resProduits.ok) throw new Error("Produits introuvables");
        const { produits } = await resProduits.json();

        setBoutique(boutique);
        setProduits(produits);
        const uniqueCollections = [...new Set(produits.map(p => p.collectionName).filter(Boolean))];
        setCollections(uniqueCollections);

        // ✅ Enregistre toute la boutique dans localStorage
        try {
          const newEntry = {
            _id: boutique._id,
            name: boutique.name,
            category: boutique.category,
            distance: boutique.distance || null,
            coverImageUrl: boutique.coverImageUrl || null,
          };

          const existing = JSON.parse(localStorage.getItem("recentBoutiques")) || [];
          const filtered = existing.filter((b) => b._id !== boutique._id);
          const updated = [newEntry, ...filtered].slice(0, 10);
          localStorage.setItem("recentBoutiques", JSON.stringify(updated));
        } catch (e) {
          console.error("Erreur stockage recentBoutiques:", e);
        }
      } catch (err) {
        console.error("❌ Erreur Vitrine:", err);
        setError(err.message || "Erreur serveur");
      }
    }

    fetchBoutiqueAndProduits();
  }, [id]);

  useEffect(() => {
    async function estimateFee() {
      if (
        !token ||
        !userData?.infosClient?.latitude ||
        !userData?.infosClient?.longitude ||
        !boutique?.location?.coordinates
      ) {
        return;
      }

      const deliveryLocation = {
        lat: userData.infosClient.latitude,
        lng: userData.infosClient.longitude,
      };

      const boutiqueLocation = {
        lat: boutique.location.coordinates[1],
        lng: boutique.location.coordinates[0],
      };

      const item = produits?.[0] || {
        name: "Produit moyen",
        price: 10,
        logisticsCategory: "carton_moyen",
        poids_kg: 0.8,
        volume_m3: 0.003,
        quantity: 1,
      };

      try {
        const response = await fetch(`${API_URL}/orders/estimate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            boutiqueId: boutique._id,
            boutiqueLocation,
            deliveryLocation,
            items: [
              {
                poids_kg: item.poids_kg ?? 0.8,
                volume_m3: item.volume_m3 ?? 0.003,
                quantity: 1
              }
            ]
          }),
        });

        const result = await response.json();
        if (result.deliveryFee) setEstimatedFee(result.deliveryFee);
        if (result.estimatedDelay) setEstimatedDelay(result.estimatedDelay);
        if (result.distanceKm && !boutique?.distance) {
          setBoutique((prev) => ({ ...prev, distance: result.distanceKm }));
        }
      } catch (error) {
        console.error("Erreur estimation frais livraison:", error);
      }
    }

    estimateFee();
  }, [boutique, userData, token, produits]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="mt-16 px-4 pb-10">
      {notification && (
        <NotificationBanner
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      {/* Cover image avec avatar superposé (style BoutiqueSelector) */}
      <div className="relative w-full max-w-[350px] mx-auto overflow-visible animate-expand-card">
        <div className="rounded-xl border-2 border-gray-100 overflow-hidden max-h-[120px]">
          <div className="aspect-[2.5/1] w-full relative">
            <img
              src={boutique.coverImageUrl}
              alt={`Image de ${boutique.name}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className="absolute bottom-[-36px] left-1/2 -translate-x-1/2 w-[72px] h-[72px] rounded-full border-2 border-white shadow overflow-hidden bg-white z-[60]">
          <img
            src={boutique.owner?.avatarUrl || "/src/assets/avatar-default.png"}
            alt={`Avatar de ${boutique.owner?.fullname || "vendeur"}`}
            title={boutique.owner?.fullname || "Vendeur"}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
      <div className="mb-4 text-center mt-10">
        <Title level={3} className="text-xl font-semibold leading-tight text-black">
          {boutique.name}
        </Title>
        <p className="text-sm text-gray-600">{boutique.category}</p>
        <p className="text-sm text-gray-500">{boutique.address}</p>
        {(estimatedFee !== null || estimatedDelay !== null || boutique?.distance) && (
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-gray-800">
            {boutique?.distance && (
              <div className="flex items-center gap-2 px-3 py-1.5 text-sm">
                <MapPin className="w-4 h-4 text-[#ed354f]" />
                <span>{boutique.distance.toFixed(1)} km</span>
              </div>
            )}
            {estimatedDelay !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 text-sm">
                <Clock className="w-4 h-4 text-[#ed354f]" />
                <span>{formatDelay(estimatedDelay)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm">
              <Star className="w-4 h-4 text-[#ed354f]" />
              <span>4.7 / 5</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 mb-2" role="search">
        <label htmlFor="product-search" className="sr-only">Rechercher un produit</label>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
          <input
            id="product-search"
            type="text"
            role="searchbox"
            aria-label="Rechercher un produit"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-[16px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ed354f]"
          />
        </div>
      </div>

      {collections.length > 0 && (
        <div className="-ml-4 mt-6 mb-4 whitespace-nowrap no-scrollbar snap-x scroll-pl-6 flex items-center justify-between gap-2">
          <div className="overflow-x-auto flex gap-2 flex-1 pl-4">
            <button
              onClick={() => setSelectedCollection("tout")}
              className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap ${
                selectedCollection === "tout"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Tous
            </button>
            {collections.map((collection) => (
              <button
                key={collection}
                onClick={() => setSelectedCollection(collection)}
                className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap ${
                  selectedCollection === collection
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {collection}
              </button>
            ))}
          </div>
          <div className="flex-shrink-0 pl-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className={`p-2 rounded-full transition ${
                viewMode === "grid"
                  ? "bg-black text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              {viewMode === "grid" ? <List size={18} /> : <LayoutGrid size={18} />}
            </button>
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-300 ${
          viewMode === "grid"
            ? "grid grid-cols-2 gap-4 animate-list-to-grid"
            : "flex flex-col gap-4 animate-grid-to-list"
        }`}
      >
        {produits
          .filter(p =>
            (selectedCollection === "tout" || p.collectionName === selectedCollection) &&
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((product) => {
            if (viewMode === "list") {
              return (
                <div
                  key={`${product._id}-${boutique._id}-${product.name}`}
                  className="group rounded-xl border border-gray-100 bg-white shadow transition-shadow hover:shadow-md px-5 py-4 flex items-center gap-5"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🧺</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1 text-left">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-gray-500 leading-snug line-clamp-2">{product.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between self-stretch gap-1">
                    <span className="text-sm font-semibold text-[#ed354f]">
                      {product.price.toFixed(2)} €
                    </span>
                    <button
                      onClick={() => {
                        addToCart({
                          merchant: boutique.name,
                          product: {
                            ...product,
                            boutique: boutique._id,
                            boutiqueDetails: {
                              name: boutique.name,
                              location: boutique.location,
                            },
                          },
                        });
                        setNotification({ message: `${product.name} ajouté au panier`, type: "success" });
                      }}
                      className="group/button flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 text-gray-600 hover:bg-[#ed354f] hover:text-white transition duration-200 active:scale-95"
                      title="Ajouter au panier"
                    >
                      <ShoppingCart size={18} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              );
            }
            // Mode grid (inchangé)
            return (
              <div
                key={`${product._id}-${boutique._id}-${product.name}`}
                className="rounded-2xl bg-white shadow-sm border border-gray-200 p-3 flex flex-col justify-between"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">🧺</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="mb-2">
                    <p className="font-semibold text-sm text-gray-800 truncate">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-gray-500 truncate">{product.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-semibold text-[#ed354f]">
                      {product.price.toFixed(2)} €
                    </span>
                    <button
                      onClick={() => {
                        addToCart({
                          merchant: boutique.name,
                          product: {
                            ...product,
                            boutique: boutique._id,
                            boutiqueDetails: {
                              name: boutique.name,
                              location: boutique.location,
                            },
                          },
                        });
                        setNotification({ message: `${product.name} ajouté au panier`, type: "success" });
                      }}
                      className="group/button flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 text-gray-600 hover:bg-[#ed354f] hover:text-white transition duration-200 active:scale-95"
                      title="Ajouter au panier"
                    >
                      <ShoppingCart size={18} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}