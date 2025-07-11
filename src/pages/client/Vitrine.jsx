// src/pages/client/Vitrine.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import Section from "../../components/ui/Section";
import Title from "../../components/ui/Title";
import Card from "../../components/ui/Card";

const API_URL = import.meta.env.VITE_API_URL;

export default function Vitrine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [boutique, setBoutique] = useState(null);
  const [produits, setProduits] = useState([]);
  const [error, setError] = useState(null);

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
    <>
      {boutique.coverImageUrl && (
        <div className="w-full h-48 md:h-64 overflow-hidden mb-4">
          <img
            src={boutique.coverImageUrl}
            alt="Image de couverture"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <Section>
        {boutique.owner?.avatarUrl && (
          <div className="flex justify-center mb-2">
            <img
              src={boutique.owner.avatarUrl}
              alt="Avatar du vendeur"
              className="w-20 h-20 rounded-full object-cover border border-gray-300"
            />
          </div>
        )}
        <Title level={2}>{boutique.name}</Title>
        <p className="text-sm text-gray-600">{boutique.category}</p>
        <p className="text-sm text-gray-500">{boutique.address}</p>
      </Section>

      <ul className="space-y-2">
        {produits.map((product) => (
          <Card key={product._id} className="flex items-center justify-between gap-4">
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
          </Card>
        ))}
      </ul>

      {produits.length > 0 && (
        <Button
          onClick={() => navigate("/client/panier")}
          className="mt-6 w-full"
        >
          Voir le panier
        </Button>
      )}
    </>
  );
}