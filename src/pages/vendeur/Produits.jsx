// src/pages/vendeur/Produits.jsx
import { useState } from "react";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function Produits() {
  const [produits, setProduits] = useState([
    { id: 1, nom: "Tomates Bio", prix: 2.5 },
    { id: 2, nom: "Pain complet", prix: 1.8 },
  ]);

  const supprimerProduit = (id) => {
    setProduits((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-green-50 pb-24">
      <Header title="Mes produits" showBack={false} backTo="/vendeur" color="green" />
      <div className="p-4 max-w-md mx-auto space-y-4">
        {produits.map((produit) => (
          <div key={produit.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-700">{produit.nom}</h3>
              <p className="text-sm text-gray-500">{produit.prix.toFixed(2)} €</p>
            </div>
            <button
              onClick={() => supprimerProduit(produit.id)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Supprimer
            </button>
          </div>
        ))}

        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          ➕ Ajouter un produit
        </button>
      </div>
      <BottomNav />
    </div>
  );
}