import { useState, useEffect } from "react";
import useBoutiques from "../../components/gestionMagasin/hooks/useBoutiques";
import useProduits from "../../components/gestionMagasin/hooks/useProduits.js";

import {
  BoutiqueSelector,
  BoutiqueModal,
  ProduitModal,
  ProduitSection,
} from "../../components/gestionMagasin";

import NotificationBanner from "../../components/ui/NotificationBanner";

const CATEGORIES = [
  "Alimentation",
  "Mobilité électrique",
  "Prêt-à-porter",
  "Électronique",
  "Beauté & Bien-être",
  "Maison & Déco",
];

export default function Produits() {
  const {
    boutiques,
    loading: boutiquesLoading,
    error: boutiquesError,
    fetchAllBoutiques,
    saveBoutique,
    deleteBoutique,
  } = useBoutiques();

  const {
    produits,
    loading: produitsLoading,
    error: produitsError,
    fetchProduitsByBoutique,
    createProduit,
    updateProduit,
    deleteProduit,
  } = useProduits();

  const [selectedBoutique, setSelectedBoutique] = useState(null);
  const [showBoutiqueModal, setShowBoutiqueModal] = useState(false);
  const [boutiqueForm, setBoutiqueForm] = useState({
    _id: null,
    name: "",
    category: "",
    coverImage: null,
    coverImageUrl: "",
  });
  const [collectionsDispo, setCollectionsDispo] = useState([]);

  const [produitForm, setProduitForm] = useState({
    _id: null,
    name: "",
    price: "",
    category: "",
    description: "",
    image: null,
  });
  const [showProduitModal, setShowProduitModal] = useState(false);

  const [notification, setNotification] = useState(null);
  const closeNotification = () => setNotification(null);

  useEffect(() => {
    fetchAllBoutiques();
  }, [fetchAllBoutiques]);

  useEffect(() => {
    if (produits.length > 0) {
      const uniqueCollections = [...new Set(
        produits.map(p => p.collectionName).filter(Boolean)
      )];
      setCollectionsDispo(uniqueCollections);
    } else {
      setCollectionsDispo([]);
    }
  }, [produits]);

  const handleSelectBoutique = (boutique) => {
    setSelectedBoutique(boutique);
    setBoutiqueForm(boutique);
    fetchProduitsByBoutique(boutique._id);
  };

  const handleCreateBoutique = () => {
    setBoutiqueForm({ _id: null, name: "", category: "", coverImage: null, coverImageUrl: "" });
    setShowBoutiqueModal(true);
  };

  const handleChangeBoutiqueForm = (e) => {
    setBoutiqueForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBoutiqueFileChange = (e) => {
    setBoutiqueForm((prev) => ({ ...prev, coverImage: e.target.files[0] }));
  };

  const handleSaveBoutique = async () => {
    try {
      const saved = await saveBoutique(boutiqueForm);
      setNotification({ message: "Boutique enregistrée.", type: "success" });
      setShowBoutiqueModal(false);
      fetchAllBoutiques();
    } catch (err) {
      setNotification({ message: err.message, type: "error" });
    }
  };

  const handleDeleteBoutique = async () => {
    if (!window.confirm("Supprimer cette boutique ?")) return;
    try {
      await deleteBoutique(boutiqueForm._id);
      setNotification({ message: "Boutique supprimée.", type: "success" });
      setShowBoutiqueModal(false);
      setSelectedBoutique(null);
      fetchAllBoutiques();
    } catch (err) {
      setNotification({ message: err.message, type: "error" });
    }
  };

  const handleAjouterProduit = () => {
    setProduitForm({ _id: null, name: "", price: "", category: "", description: "", image: null, collectionName: "" });
    setShowProduitModal(true);
  };

  const handleModifierProduit = (produit) => {
    setProduitForm({
      _id: produit._id,
      name: produit.name,
      price: produit.price,
      category: produit.category,
      description: produit.description,
      collectionName: produit.collectionName || "",
      image: null,
    });
    setShowProduitModal(true);
  };

  const handleChangeProduitForm = (e) => {
    setProduitForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProduitFileChange = (e) => {
    setProduitForm((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSaveProduit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", produitForm.name);
      formData.append("price", produitForm.price);
      formData.append("category", produitForm.category);
      formData.append("description", produitForm.description);
      formData.append("boutiqueId", selectedBoutique._id);
      formData.append("collectionName", produitForm.collectionName);
      if (produitForm.image) formData.append("image", produitForm.image);
      if (produitForm._id) {
        await updateProduit(produitForm._id, formData);
      } else {
        await createProduit(formData);
      }
      setNotification({ message: "Produit enregistré.", type: "success" });
      setShowProduitModal(false);
      fetchProduitsByBoutique(selectedBoutique._id);
    } catch (err) {
      setNotification({ message: err.message, type: "error" });
    }
  };

  const handleSupprimerProduit = async (id) => {
    try {
      await deleteProduit(id);
      setNotification({ message: "Produit supprimé.", type: "success" });
      fetchProduitsByBoutique(selectedBoutique._id);
    } catch (err) {
      setNotification({ message: err.message, type: "error" });
    }
  };

  return (
    <>
      {notification && (
        <NotificationBanner message={notification.message} type={notification.type} onClose={closeNotification} />
      )}

      <BoutiqueSelector
        boutiques={boutiques || []}
        selectedId={selectedBoutique?._id}
        onSelect={handleSelectBoutique}
        onCreate={handleCreateBoutique}
      />

      {showBoutiqueModal && (
        <BoutiqueModal
          boutique={boutiqueForm}
          onChange={handleChangeBoutiqueForm}
          onFileChange={handleBoutiqueFileChange}
          onSave={handleSaveBoutique}
          onDelete={handleDeleteBoutique}
          onClose={() => setShowBoutiqueModal(false)}
        />
      )}

      <ProduitSection
        produits={produits}
        produitsLoading={produitsLoading}
        produitsError={produitsError}
        boutique={selectedBoutique}
        onAjouterProduit={handleAjouterProduit}
        onModifierProduit={handleModifierProduit}
        onSupprimerProduit={handleSupprimerProduit}
      />

      {showProduitModal && (
        <ProduitModal
          boutique={selectedBoutique}
          produit={produitForm}
          onChange={handleChangeProduitForm}
          onFileChange={handleProduitFileChange}
          onSave={handleSaveProduit}
          onCancel={() => setShowProduitModal(false)}
          categories={CATEGORIES}
          collectionsDispo={collectionsDispo}
        />
      )}
    </>
  );
}