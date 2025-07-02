import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Card from "../../components/ui/Card";
import Title from "../../components/ui/Title";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import NotificationBanner from "../../components/ui/NotificationBanner";

const API_BASE = "https://api.riveltime.app/api";

export default function Produits() {
  // États boutique
  const [boutique, setBoutique] = useState({
    name: "",
    category: "",
    coverImage: null,
    coverImageUrl: "",
  });
  const [boutiqueLoading, setBoutiqueLoading] = useState(true);
  const [boutiqueError, setBoutiqueError] = useState(null);

  // États produits
  const [produits, setProduits] = useState([]);
  const [produitsLoading, setProduitsLoading] = useState(true);
  const [produitsError, setProduitsError] = useState(null);

  // Modale ajout/modification produit
  const [showProduitModal, setShowProduitModal] = useState(false);
  const [nouveauProduit, setNouveauProduit] = useState({
    _id: null,
    name: "",
    price: "",
    category: "",
    description: "",
    image: null,
  });

  // Notification globale
  const [notification, setNotification] = useState(null);

  const { getAccessTokenSilently } = useAuth0();

  // --- Fonctions fetch ---

  // Charger boutique (modification de l’URL)
  async function fetchBoutique(token) {
    setBoutiqueLoading(true);
    setBoutiqueError(null);
    try {
      const res = await fetch(`${API_BASE}/boutiques/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur chargement boutique");
      const data = await res.json();
      // Ajustement selon structure renvoyée
      const b = data.boutique;
      setBoutique({
        name: b?.name || "",
        category: b?.category || "",
        coverImageUrl: b?.coverImageUrl || "",
        coverImage: null,
        _id: b?._id || null,
      });
    } catch (error) {
      setBoutiqueError(error.message);
      console.error(error);
    } finally {
      setBoutiqueLoading(false);
    }
  }

  // Charger produits
  async function fetchProduits(token) {
    setProduitsLoading(true);
    setProduitsError(null);
    try {
      const res = await fetch(`${API_BASE}/products/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur chargement produits");
      const data = await res.json();
      setProduits(data);
    } catch (error) {
      setProduitsError(error.message);
      console.error(error);
    } finally {
      setProduitsLoading(false);
    }
  }

  // Charger données au montage
  useEffect(() => {
    async function loadData() {
      try {
        const token = await getAccessTokenSilently({
          audience: "https://api.riveltime.app/api",
        });
        await Promise.all([fetchBoutique(token), fetchProduits(token)]);
      } catch (err) {
        console.error("Erreur récupération token :", err);
      }
    }
    loadData();
  }, [getAccessTokenSilently]);

  // --- Gestion boutique ---

  const handleBoutiqueChange = (e) => {
    setBoutique({ ...boutique, [e.target.name]: e.target.value });
  };

  const handleBoutiqueFileChange = (e) => {
    setBoutique({ ...boutique, coverImage: e.target.files[0] });
  };

  const sauvegarderBoutique = async () => {
    if (!boutique.name.trim() || !boutique.category.trim()) {
      setNotification({ message: "Nom et catégorie sont requis.", type: "error" });
      return;
    }
    try {
      const token = await getAccessTokenSilently({
        audience: "https://api.riveltime.app/api",
      });
      const formData = new FormData();
      formData.append("name", boutique.name);
      formData.append("category", boutique.category);
      if (boutique.coverImage) formData.append("coverImage", boutique.coverImage);

      const res = await fetch(`${API_BASE}/boutiques/me`, {  // URL corrigée ici aussi
        method: "POST", // ou PUT selon backend (vérifie)
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur sauvegarde boutique");
      const data = await res.json();
      setBoutique((b) => ({
        ...b,
        coverImageUrl: data.coverImageUrl || b.coverImageUrl,
        coverImage: null,
      }));
      setNotification({ message: "Boutique mise à jour avec succès.", type: "success" });
    } catch (err) {
      console.error(err);
      setNotification({ message: "Erreur lors de la sauvegarde.", type: "error" });
    }
  };

  // --- Gestion produit ---

  const handleProduitChange = (e) => {
    setNouveauProduit({ ...nouveauProduit, [e.target.name]: e.target.value });
  };

  const handleProduitFileChange = (e) => {
    setNouveauProduit({ ...nouveauProduit, image: e.target.files[0] });
  };

  // Ajouter ou modifier un produit
  const saveProduit = async () => {
    if (!nouveauProduit.name.trim() || !nouveauProduit.price) {
      setNotification({ message: "Nom et prix sont requis.", type: "error" });
      return;
    }

    try {
      const token = await getAccessTokenSilently({ audience: "https://api.riveltime.app/api" });
      const formData = new FormData();
      formData.append("name", nouveauProduit.name);
      formData.append("price", nouveauProduit.price);
      formData.append("category", nouveauProduit.category);
      formData.append("description", nouveauProduit.description || "");
      if (nouveauProduit.image) formData.append("image", nouveauProduit.image);

      // 🔁 Ajout de l'ID de la boutique
      formData.append("boutiqueId", boutique._id);

      const method = nouveauProduit._id ? "PUT" : "POST";
      const url = nouveauProduit._id
        ? `${API_BASE}/products/${nouveauProduit._id}`
        : `${API_BASE}/products`;

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur sauvegarde produit");
      await fetchProduits(token);
      setShowProduitModal(false);
      setNouveauProduit({
        _id: null,
        name: "",
        price: "",
        category: "",
        description: "",
        image: null,
      });
      setNotification({ message: "Produit sauvegardé avec succès.", type: "success" });
    } catch (err) {
      console.error(err);
      setNotification({ message: "Erreur lors de la sauvegarde du produit.", type: "error" });
    }
  };

  // Supprimer un produit
  const supprimerProduit = async (id) => {
    try {
      const token = await getAccessTokenSilently({ audience: "https://api.riveltime.app/api" });
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur suppression produit");
      await fetchProduits(token);
      setNotification({ message: "Produit supprimé.", type: "success" });
    } catch (err) {
      console.error(err);
      setNotification({ message: "Erreur lors de la suppression du produit.", type: "error" });
    }
  };

  // --- Gestion notification ---
  const closeNotification = () => setNotification(null);

  // --- UI modale produit (simple exemple) ---
  const ProduitModal = () => (
    <div className="modal">
      <Card className="p-4">
        <Title level={3}>{nouveauProduit._id ? "Modifier" : "Ajouter"} un produit</Title>
        <Input
          label="Nom"
          name="name"
          value={nouveauProduit.name}
          onChange={handleProduitChange}
        />
        <Input
          label="Prix"
          name="price"
          type="number"
          value={nouveauProduit.price}
          onChange={handleProduitChange}
        />
        <Input
          label="Catégorie"
          name="category"
          value={nouveauProduit.category}
          onChange={handleProduitChange}
        />
        <Input
          label="Description"
          name="description"
          value={nouveauProduit.description}
          onChange={handleProduitChange}
        />
        <Input
          label="Image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleProduitFileChange}
        />
        <Button onClick={saveProduit} variant="success" className="mt-4">
          {nouveauProduit._id ? "Modifier" : "Ajouter"}
        </Button>
        <Button onClick={() => setShowProduitModal(false)} className="mt-2">
          Annuler
        </Button>
      </Card>
    </div>
  );

  return (
    <>
      {notification && (
        <NotificationBanner
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <Card className="mb-6 p-4">
        <Title level={3}>Ma boutique</Title>
        {boutiqueLoading ? (
          <p>Chargement de la boutique...</p>
        ) : boutiqueError ? (
          <p className="text-red-600">Erreur : {boutiqueError}</p>
        ) : (
          <>
            <Input
              label="Nom de la boutique"
              name="name"
              value={boutique.name}
              onChange={handleBoutiqueChange}
            />
            <label className="block mt-4 font-semibold">Catégorie</label>
            <select
              name="category"
              value={boutique.category}
              onChange={handleBoutiqueChange}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="">-- Sélectionner une catégorie --</option>
              <option value="Alimentation">Alimentation</option>
              <option value="Mobilité électrique">Mobilité électrique</option>
              <option value="Prêt-à-porter">Prêt-à-porter</option>
              <option value="Électronique">Électronique</option>
              <option value="Beauté & Bien-être">Beauté & Bien-être</option>
              <option value="Maison & Déco">Maison & Déco</option>
            </select>
            <div>
              {boutique.coverImageUrl && (
                <img
                  src={boutique.coverImageUrl}
                  alt="Image de couverture boutique"
                  className="w-full h-40 object-cover rounded mt-2"
                />
              )}
              <Input
                label="Image de couverture"
                name="coverImage"
                type="file"
                accept="image/*"
                onChange={handleBoutiqueFileChange}
              />
            </div>
            <Button className="mt-4" variant="success" onClick={sauvegarderBoutique}>
              Sauvegarder la boutique
            </Button>
          </>
        )}
      </Card>

      <Card className="p-4">
        <Title level={3}>Mes produits</Title>
        {produitsLoading ? (
          <p>Chargement des produits...</p>
        ) : produitsError ? (
          <p className="text-red-600">Erreur : {produitsError}</p>
        ) : produits.length === 0 ? (
          <p>Aucun produit disponible.</p>
        ) : (
          <ul>
            {produits.map((prod) => (
              <li key={prod._id} className="mb-4 border-b pb-2">
                <strong>{prod.name}</strong> — {prod.category} — {prod.price} €
                <div className="mt-1 flex gap-2">
                  <Button
                    variant="warning"
                    onClick={() => {
                      setNouveauProduit({
                        _id: prod._id,
                        name: prod.name,
                        price: prod.price,
                        category: prod.category,
                        description: prod.description,
                        image: null,
                      });
                      setShowProduitModal(true);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (window.confirm("Supprimer ce produit ?")) supprimerProduit(prod._id);
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {showProduitModal && <ProduitModal />}
    </>
  );
}