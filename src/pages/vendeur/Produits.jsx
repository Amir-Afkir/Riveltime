// src/pages/vendeur/Produits.jsx
import { useState } from "react";
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Card from "../../components/ui/Card";
import Title from "../../components/ui/Title";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function Produits() {
  const [produits, setProduits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nouveauProduit, setNouveauProduit] = useState({
    _id: null,
    name: "",
    price: "",
    category: "",
    description: "",
    image: null
  });
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "https://riveltime/api",
        });
        const res = await fetch("http://localhost:5000/api/products/mine", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();
        setProduits(data);
      } catch (err) {
        console.error("❌ Erreur chargement produits :", err);
      }
    };

    fetchProduits();
  }, []);

  const handleChange = (e) => {
    setNouveauProduit({ ...nouveauProduit, [e.target.name]: e.target.value });
  };

  const handleChangeFile = (e) => {
    setNouveauProduit({ ...nouveauProduit, image: e.target.files[0] });
  };

  const sauvegarderProduit = async () => {
    if (!nouveauProduit.name || !nouveauProduit.price) {
      alert("Tous les champs sont requis.");
      return;
    }
    try {
      const token = await getAccessTokenSilently({
        audience: "https://riveltime/api",
      });
      const formData = new FormData();
      formData.append("name", nouveauProduit.name);
      formData.append("price", nouveauProduit.price);
      formData.append("category", nouveauProduit.category);
      formData.append("description", nouveauProduit.description);
      if (nouveauProduit.image) {
        formData.append("image", nouveauProduit.image);
      }

      const url = nouveauProduit._id
        ? `http://localhost:5000/api/products/${nouveauProduit._id}`
        : "http://localhost:5000/api/products";

      const method = nouveauProduit._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);

      const updated = await res.json();

      setProduits((prev) => {
        if (nouveauProduit._id) {
          return prev.map((p) => (p._id === updated._id ? updated : p));
        }
        return [...prev, updated];
      });

      setNouveauProduit({
        _id: null,
        name: "",
        price: "",
        category: "",
        description: "",
        image: null
      });
      setShowModal(false);
    } catch (err) {
      console.error("❌", err);
    }
  };

  const supprimerProduit = async (id) => {
    try {
      const token = await getAccessTokenSilently({
        audience: "https://riveltime/api",
      });
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setProduits((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("❌ Erreur suppression produit :", err);
    }
  };

  return (
    <div className="space-y-4">
      {produits.map((produit) => (
        <Card key={produit._id} className="flex items-center gap-4">
          {produit.imageUrl && (
            <img
              src={produit.imageUrl}
              alt={produit.name}
              className="w-24 min-w-[96px] h-24 aspect-square max-w-full object-cover rounded-md shadow border border-gray-200"
            />
          )}
          <div className="flex-1">
            <div className="space-y-1">
              <Title level={4} className="text-gray-800 font-semibold">{produit.name}</Title>
              <p className="text-sm text-gray-600">{produit.price.toFixed(2)} €</p>
              {produit.description && (
                <p className="text-sm text-gray-500">{produit.description}</p>
              )}
              {produit.category && (
                <p className="text-sm italic text-gray-400">{produit.category}</p>
              )}
            </div>
            <div className="flex mt-3 space-x-2">
              <Button
                onClick={() => {
                  setNouveauProduit({
                    _id: produit._id,
                    name: produit.name,
                    price: produit.price,
                    category: produit.category,
                    description: produit.description,
                    image: null
                  });
                  setShowModal(true);
                }}
                variant="primary"
                size="small"
              >
                Modifier
              </Button>
              <Button
                onClick={() => supprimerProduit(produit._id)}
                variant="danger"
                size="small"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Button className="w-full" variant="success" onClick={() => setShowModal(true)}>
        ➕ Ajouter un produit
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <Title level={3}>Nouveau produit</Title>
            {nouveauProduit.image && typeof nouveauProduit.image === 'string' && (
              <img
                src={nouveauProduit.image}
                alt="Aperçu"
                className="w-full h-40 object-cover rounded"
              />
            )}
            <div className="space-y-4 mt-4">
              <Input label="Titre" name="name" value={nouveauProduit.name} onChange={handleChange} />
              <Input label="Catégorie" name="category" value={nouveauProduit.category} onChange={handleChange} />
              <Input label="Description" name="description" value={nouveauProduit.description} onChange={handleChange} />
              <Input label="Prix (€)" name="price" type="number" value={nouveauProduit.price} onChange={handleChange} />
              <Input
                label="Image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleChangeFile}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
                <Button variant="success" onClick={sauvegarderProduit}>
                  {nouveauProduit._id ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}