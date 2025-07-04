import React from 'react';

export function ProduitListe({ boutique, produitsState, setProduitsState, fetchProduitsParBoutique, saveProduit, supprimerProduit }) {
  const { produits, showProduitModal, produitEnCours } = produitsState;

  const handleAjouterProduit = () => {
    setProduitsState({
      ...produitsState,
      produitEnCours: { nom: '', description: '', prix: 0 },
      showProduitModal: true,
    });
  };

  const handleEditerProduit = (produit) => {
    setProduitsState({
      ...produitsState,
      produitEnCours: produit,
      showProduitModal: true,
    });
  };

  const handleSupprimerProduit = (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      supprimerProduit(id);
    }
  };

  const ProduitModal = () => {
    const [produit, setProduit] = React.useState(produitEnCours);

    React.useEffect(() => {
      setProduit(produitEnCours);
    }, [produitEnCours]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setProduit({ ...produit, [name]: name === 'prix' ? parseFloat(value) : value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      saveProduit(produit);
      setProduitsState({ ...produitsState, showProduitModal: false, produitEnCours: null });
      fetchProduitsParBoutique(boutique._id);
    };

    const handleClose = () => {
      setProduitsState({ ...produitsState, showProduitModal: false, produitEnCours: null });
    };

    return (
      <div className="modal">
        <form onSubmit={handleSubmit}>
          <h2>{produit._id ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
          <label>
            Nom:
            <input type="text" name="nom" value={produit.nom} onChange={handleChange} required />
          </label>
          <label>
            Description:
            <textarea name="description" value={produit.description} onChange={handleChange} />
          </label>
          <label>
            Prix:
            <input type="number" name="prix" value={produit.prix} onChange={handleChange} required min="0" step="0.01" />
          </label>
          <button type="submit">Enregistrer</button>
          <button type="button" onClick={handleClose}>Annuler</button>
        </form>
      </div>
    );
  };

  return (
    <div>
      <button onClick={handleAjouterProduit}>Ajouter un produit</button>
      {!boutique._id ? (
        <p>Veuillez sélectionner une boutique pour voir les produits.</p>
      ) : (
        <ul>
          {produits.map((produit) => (
            <li key={produit._id}>
              <h3>{produit.nom}</h3>
              <p>{produit.description}</p>
              <p>Prix: {produit.prix} €</p>
              <button onClick={() => handleEditerProduit(produit)}>Éditer</button>
              <button onClick={() => handleSupprimerProduit(produit._id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      )}
      {showProduitModal && <ProduitModal />}
    </div>
  );
}

export default ProduitListe;
