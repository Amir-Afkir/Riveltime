

import PropTypes from "prop-types";
import Card from "../../components/ui/Card";
import Title from "../../components/ui/Title";
import Button from "../../components/ui/Button";

export default function ProduitSection({
  produits,
  produitsLoading,
  produitsError,
  boutique,
  onAjouterProduit,
  onModifierProduit,
  onSupprimerProduit,
}) {
  return (
    <Card className="p-4">
      <Title level={3}>Mes produits</Title>

      {!boutique?._id ? (
        <p className="text-gray-600">Veuillez sélectionner une boutique.</p>
      ) : (
        <>

          {produitsLoading ? (
            <p>Chargement des produits...</p>
          ) : produitsError ? (
            <p className="text-red-600">Erreur : {produitsError}</p>
          ) : produits.length === 0 ? (
            <p>Aucun produit pour cette boutique.</p>
          ) : (
            <ul>
              {produits.map((prod) => (
                <li key={prod._id} className="mb-4 border-b pb-2">
                  <strong>{prod.name}</strong> — {prod.category} — {prod.price} €
                  <div className="mt-1 flex gap-2">
                    <Button variant="warning" onClick={() => onModifierProduit(prod)}>
                      Modifier
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (window.confirm("Supprimer ce produit ?")) {
                          onSupprimerProduit(prod._id);
                        }
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button
            variant="primary"
            className="mb-4"
            onClick={onAjouterProduit}
          >
            Ajouter un produit
          </Button>
        </>
      )}
    </Card>
  );
}

ProduitSection.propTypes = {
  produits: PropTypes.array.isRequired,
  produitsLoading: PropTypes.bool,
  produitsError: PropTypes.string,
  boutique: PropTypes.object,
  onAjouterProduit: PropTypes.func.isRequired,
  onModifierProduit: PropTypes.func.isRequired,
  onSupprimerProduit: PropTypes.func.isRequired,
};