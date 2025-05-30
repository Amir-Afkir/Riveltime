// src/pages/vendeur/Produits.jsx
import { useState } from "react";
import Header from "../../components/layout/Header";
import BottomNav from "../../components/layout/BottomNav";
import Card from "../../components/ui/Card";
import Title from "../../components/ui/Title";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function Produits() {
  const [produits, setProduits] = useState([
    { id: 1, nom: "Tomates Bio", prix: 2.5 },
    { id: 2, nom: "Pain complet", prix: 1.8 },
  ]);

  const supprimerProduit = (id) => {
    setProduits((prev) => prev.filter((p) => p.id !== id));
  };


  const [showModal, setShowModal] = useState(false);
  const [nouveauProduit, setNouveauProduit] = useState({ nom: "", prix: "" });
  
  const ajouterProduit = () => {
    const id = Date.now();
    setProduits([...produits, { id, ...nouveauProduit, prix: parseFloat(nouveauProduit.prix) }]);
    setNouveauProduit({ nom: "", prix: "" });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-green-50 pb-24">
      <Header title="Mes produits" showBack={false} backTo="/vendeur" color="green" />
      <div className="p-4 max-w-md mx-auto space-y-4">
        {produits.map((produit) => (
          <Card key={produit.id} className="flex justify-between items-center">
            <div>
              <Title level={4} className="text-gray-700">{produit.nom}</Title>
              <p className="text-sm text-gray-500">{produit.prix.toFixed(2)} €</p>
            </div>
            <Button
              onClick={() => supprimerProduit(produit.id)}
              variant="danger"
              size="small"
            >
              Supprimer
            </Button>
          </Card>
        ))}

        <Button className="w-full" variant="success" onClick={() => setShowModal(true)}>
          ➕ Ajouter un produit
        </Button>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-sm">
              <Title level={3}>Nouveau produit</Title>
              <div className="space-y-4 mt-4">
                <Input
                  label="Nom du produit"
                  name="nom"
                  value={nouveauProduit.nom}
                  onChange={(e) => setNouveauProduit({ ...nouveauProduit, nom: e.target.value })}
                />
                <Input
                  label="Prix (€)"
                  name="prix"
                  type="number"
                  value={nouveauProduit.prix}
                  onChange={(e) => setNouveauProduit({ ...nouveauProduit, prix: e.target.value })}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </Button>
                  <Button variant="success" onClick={ajouterProduit}>
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}