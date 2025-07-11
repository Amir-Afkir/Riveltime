// src/pages/client/Vitrine.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import Title from "../../components/ui/Title";
import Card from "../../components/ui/Card";
import NotificationBanner from "../../components/ui/NotificationBanner";

const API_URL = import.meta.env.VITE_API_URL;

export default function Vitrine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [boutique, setBoutique] = useState(null);
  const [produits, setProduits] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("tout");
  const closeNotification = () => setNotification(null);

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
      } catch (err) {
        console.error("❌ Erreur Vitrine:", err);
        setError(err.message || "Erreur serveur");
      }
    }

    fetchBoutiqueAndProduits();
  }, [id]);

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
      </div>

      {collections.length > 0 && (
        <div className="mt-6 mb-4 overflow-x-auto px-4 -mx-4 ">
          <div className="flex gap-2 w-max">
            <button
              onClick={() => setSelectedCollection("tout")}
              className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap ${
                selectedCollection === "tout"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Tous les produits
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
        </div>
      )}

      <Card className="p-4">
        <ul className="space-y-3">
          {produits
            .filter(p => selectedCollection === "tout" || p.collectionName === selectedCollection)
            .map((product) => (
            <li key={product._id}>
              <div className="flex items-center justify-between gap-4 bg-white rounded-2xl shadow-sm px-4 py-3 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">🧺</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{product.name}</p>
                    {product.description && (
                      <p className="text-sm text-gray-500">{product.description}</p>
                    )}
                    <p className="text-sm text-black mt-1">{product.price.toFixed(2)} €</p>
                  </div>
                </div>
                <Button
                  onClick={() => addToCart({ merchant: boutique.name, product })}
                  className="text-sm"
                >
                  Ajouter
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {produits.length > 0 && (
        <Button
          onClick={() => navigate("/client/panier")}
          className="mt-6 w-full"
        >
          Voir le panier
        </Button>
      )}
    </div>
  );
}