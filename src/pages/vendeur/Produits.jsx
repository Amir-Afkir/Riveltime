import { useState, useEffect, useMemo } from "react";
import useBoutiques from "../../hooks/useBoutiques.js";
import useProduits from "../../hooks/useProduits.js";

import {
  BoutiqueSelector,
  ProduitSection,
  GestionModal,
} from "../../components/gestionMagasin/index.js";

import NotificationBanner from "../../components/ui/NotificationBanner.jsx";

const CATEGORIES = [
  "Alimentation",
  "Mobilité électrique",
  "Prêt-à-porter",
  "Électronique",
  "Beauté & Bien-être",
  "Maison & Déco",
];

const INITIAL_BOUTIQUE_FORM = {
  _id: null,
  name: "",
  category: "",
  address: "",
  location: null,
  coverImage: null,
  coverImageUrl: "",
};

const INITIAL_PRODUIT_FORM = {
  _id: null,
  name: "",
  price: "",
  category: "",
  description: "",
  image: null,
  collectionName: "",
  logisticsCategory: "carton_moyen",
};

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
  const [boutiqueForm, setBoutiqueForm] = useState(INITIAL_BOUTIQUE_FORM);
  const [collectionsDispo, setCollectionsDispo] = useState([]);

  const [produitForm, setProduitForm] = useState(INITIAL_PRODUIT_FORM);
  const [showProduitModal, setShowProduitModal] = useState(false);

  const [notification, setNotification] = useState(null);
  const closeNotification = () => setNotification(null);

  // Reset functions
  const resetBoutiqueForm = () => setBoutiqueForm(INITIAL_BOUTIQUE_FORM);
  const resetProduitForm = () => setProduitForm(INITIAL_PRODUIT_FORM);

  // Effects
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

  // Handle functions for boutiques
  const handleSelectBoutique = (boutique) => {
    setSelectedBoutique(boutique);
    setBoutiqueForm(boutique || INITIAL_BOUTIQUE_FORM);
    if (boutique?._id) {
      fetchProduitsByBoutique(boutique._id);
    }
  };

  const handleCreateBoutique = (b = null) => {
    setBoutiqueForm(
      b
        ? { ...b, coverImage: null } // modification existante
        : INITIAL_BOUTIQUE_FORM // création
    );
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
      // Si location manquante, essayer de la récupérer via géocodage
      if (!boutiqueForm.location && boutiqueForm.address?.length > 3) {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(boutiqueForm.address)}`);
        const dataAPI = await res.json();
        const feature = dataAPI.features?.[0];
        if (!feature) {
          setNotification({ message: "Adresse non trouvée. Veuillez saisir une adresse plus précise.", type: "error" });
          return;
        }
        boutiqueForm.location = {
          type: "Point",
          coordinates: feature.geometry.coordinates,
        };
      }

      const saved = await saveBoutique(boutiqueForm);
      setNotification({ message: "Boutique enregistrée.", type: "success" });
      setShowBoutiqueModal(false);
      fetchAllBoutiques();
      if (
        selectedBoutique &&
        selectedBoutique._id === saved._id &&
        (selectedBoutique.coverImageUrl !== saved.coverImageUrl ||
          selectedBoutique.name !== saved.name ||
          selectedBoutique.address !== saved.address)
      ) {
        setSelectedBoutique({
          ...saved,
          owner: selectedBoutique.owner,
        });
      }
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

  // Handle functions for produits
  const handleAjouterProduit = () => {
    resetProduitForm();
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
      logisticsCategory: produit.logisticsCategory || "medium",
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
      formData.append("logisticsCategory", produitForm.logisticsCategory || "medium");
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

  const memoizedSelectedId = useMemo(() => selectedBoutique?._id, [selectedBoutique?._id]);

  return (
    <div className="px-4 pb-10">
      {notification && (
        <NotificationBanner
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      {/* Boutique Selector */}
      <BoutiqueSelector
        boutiques={boutiques || []}
        selectedId={memoizedSelectedId}
        onSelect={handleSelectBoutique}
        onCreate={handleCreateBoutique}
        onEdit={handleCreateBoutique}
      />

      {/* Gestion Modal */}
      {(showBoutiqueModal || showProduitModal) && (
        <GestionModal
          type={showBoutiqueModal ? "boutique" : "produit"}
          data={showBoutiqueModal ? boutiqueForm : produitForm}
          boutique={selectedBoutique}
          onChange={showBoutiqueModal ? handleChangeBoutiqueForm : handleChangeProduitForm}
          onFileChange={showBoutiqueModal ? handleBoutiqueFileChange : handleProduitFileChange}
          onSave={showBoutiqueModal ? handleSaveBoutique : handleSaveProduit}
          onDelete={showBoutiqueModal ? handleDeleteBoutique : () => handleSupprimerProduit(produitForm._id)}
          onClose={() => {
            if (showBoutiqueModal) {
              setShowBoutiqueModal(false);
              resetBoutiqueForm();
            } else {
              setShowProduitModal(false);
              resetProduitForm();
            }
          }}
          categories={CATEGORIES}
          collectionsDispo={collectionsDispo}
        />
      )}

      {/* Produit Section */}
      <ProduitSection
        produits={produits}
        produitsLoading={produitsLoading}
        produitsError={produitsError}
        boutique={selectedBoutique}
        onAjouterProduit={handleAjouterProduit}
        onModifierProduit={handleModifierProduit}
        onSupprimerProduit={handleSupprimerProduit}
        onAjouterBoutique={handleCreateBoutique}
      />
    </div>
  );
}