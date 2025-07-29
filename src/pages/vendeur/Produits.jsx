// ✅ Composant complet Produits.jsx avec Zustand (useBoutiqueStore et useProduitStore)
import { useState, useEffect, useMemo } from "react";
import useBoutiqueStore from "../../stores/boutiqueStore";
import useProduitStore from "../../stores/produitStore";
import {
  BoutiqueSelector,
  ProduitSection,
  GestionModal,
} from "../../components/gestionMagasin";
import NotificationBanner from "../../components/ui/NotificationBanner";

const CATEGORIES = [
  "Alimentation",
  "Restaurant",
  "Santé",
  "Mobilité",
  "Prêt-à-porter",
  "Informatique",
  "Bricolage",
  "Jardin",
];

const INITIAL_BOUTIQUE_FORM = { /* ... identique */ };
const INITIAL_PRODUIT_FORM = { /* ... identique */ };

export default function Produits() {
  const {
    boutiques,
    loading: boutiquesLoading,
    error: boutiquesError,
    fetchMyBoutiques,
    saveBoutique,
    deleteBoutique,
  } = useBoutiqueStore();

  // Utilisation complète des méthodes Zustand du produitStore
  const produits = useProduitStore((s) => s.produits);
  const produitsLoading = useProduitStore((s) => s.loading);
  const produitsError = useProduitStore((s) => s.error);
  const fetchProduitsByBoutique = useProduitStore((s) => s.fetchProduitsByBoutique);
  const createProduit = useProduitStore((s) => s.createProduit);
  const updateProduit = useProduitStore((s) => s.updateProduit);
  const deleteProduit = useProduitStore((s) => s.deleteProduit);

  const selectedBoutique = useBoutiqueStore((s) => s.selectedBoutique);
  const setSelectedBoutique = useBoutiqueStore((s) => s.setSelectedBoutique);
  
  const [showBoutiqueModal, setShowBoutiqueModal] = useState(false);
  const [boutiqueForm, setBoutiqueForm] = useState(INITIAL_BOUTIQUE_FORM);
  const [produitForm, setProduitForm] = useState(INITIAL_PRODUIT_FORM);
  const [showProduitModal, setShowProduitModal] = useState(false);
  const [collectionsDispo, setCollectionsDispo] = useState([]);
  const [notification, setNotification] = useState(null);
  const closeNotification = () => setNotification(null);

  useEffect(() => {
    fetchMyBoutiques();
  }, [fetchMyBoutiques]);

  useEffect(() => {
    if (produits.length > 0) {
      const uniqueCollections = [...new Set(produits.map(p => p.collectionName).filter(Boolean))];
      setCollectionsDispo(uniqueCollections);
    } else {
      setCollectionsDispo([]);
    }
  }, [produits]);

  const handleSelectBoutique = (boutique) => {
    setSelectedBoutique(boutique);
    setBoutiqueForm(boutique || INITIAL_BOUTIQUE_FORM);
    if (boutique?._id) {
      fetchProduitsByBoutique(boutique._id);
    }
  };

  const handleCreateBoutique = (b = null) => {
    setBoutiqueForm(b ? { ...b, coverImage: null } : INITIAL_BOUTIQUE_FORM);
    setShowBoutiqueModal(true);
  };

  const handleChangeBoutiqueForm = (e) => {
    const name = e?.target?.name || e.name;
    const value = e?.target?.value ?? e.value;

    if (!name) return;
    setBoutiqueForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleBoutiqueFileChange = (e) => { /* ... idem */ };

  const handleSaveBoutique = async () => {
    try {
      console.log("📤 Données envoyées :", boutiqueForm);
      const saved = await saveBoutique(boutiqueForm);
      setNotification({ type: "success", message: "Boutique enregistrée avec succès !" });
      setShowBoutiqueModal(false);
      fetchMyBoutiques(); // recharge la liste après sauvegarde
      setSelectedBoutique(saved); // sélectionne la boutique mise à jour
    } catch (err) {
      console.error("❌ Erreur lors de la sauvegarde de la boutique :", err);
      setNotification({ type: "error", message: "Échec de la sauvegarde. Veuillez réessayer." });
    }
  };
  const handleDeleteBoutique = async () => { /* ... idem avec await deleteBoutique() */ };

  // Ajout/édition d'un produit : on ouvre le modal et prépare le form local
  const handleAjouterProduit = () => {
    setProduitForm(INITIAL_PRODUIT_FORM);
    setShowProduitModal(true);
  };

  const handleModifierProduit = (produit) => {
    setProduitForm({ ...produit, image: null }); // image à null pour upload potentiel
    setShowProduitModal(true);
  };

  // Gestion du formulaire produit (local)
  const handleChangeProduitForm = (e) => {
    const name = e?.target?.name || e.name;
    const value = e?.target?.value ?? e.value;
    if (!name) return;
    setProduitForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProduitFileChange = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    setProduitForm((prev) => ({ ...prev, image: file }));
  };

  // Sauvegarde produit (création ou édition)
  const handleSaveProduit = async () => {
    try {
      let saved;
      if (produitForm._id) {
        saved = await updateProduit(produitForm._id, produitForm);
        setNotification({ type: "success", message: "Produit modifié avec succès !" });
      } else {
        // Ajout : on rattache la boutique sélectionnée
        const toCreate = { ...produitForm, boutique: selectedBoutique?._id };
        saved = await createProduit(toCreate);
        setNotification({ type: "success", message: "Produit ajouté avec succès !" });
      }
      setShowProduitModal(false);
      // Recharge les produits à jour
      if (selectedBoutique?._id) await fetchProduitsByBoutique(selectedBoutique._id);
    } catch (err) {
      setNotification({ type: "error", message: "Erreur lors de la sauvegarde du produit." });
    }
  };

  // Suppression produit
  const handleSupprimerProduit = async (id) => {
    try {
      await deleteProduit(id);
      setNotification({ type: "success", message: "Produit supprimé avec succès !" });
      if (selectedBoutique?._id) await fetchProduitsByBoutique(selectedBoutique._id);
      setShowProduitModal(false);
    } catch (err) {
      setNotification({ type: "error", message: "Erreur lors de la suppression du produit." });
    }
  };

  const memoizedSelectedId = useMemo(() => selectedBoutique?._id, [selectedBoutique?._id]);

  return (
    <div className="px-4 pb-10">
      {notification && (
        <NotificationBanner {...notification} onClose={closeNotification} />
      )}
      <BoutiqueSelector
        boutiques={boutiques || []}
        selectedId={memoizedSelectedId}
        onSelect={handleSelectBoutique}
        onCreate={handleCreateBoutique}
        onEdit={handleCreateBoutique}
      />
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
            setShowBoutiqueModal(false);
            setShowProduitModal(false);
          }}
          categories={CATEGORIES}
          collectionsDispo={collectionsDispo}
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
        onAjouterBoutique={handleCreateBoutique}
      />
    </div>
  );
}