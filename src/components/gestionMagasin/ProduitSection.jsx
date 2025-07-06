import PropTypes from "prop-types";
import { Plus, Pencil, ArrowRight } from "lucide-react";

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
  const hasBoutique = !!boutique?._id;

  const renderNoBoutique = () => (
    <>
      <div className="text-center">
        <Title level={3}>Aucune boutique sélectionnée</Title>
        <p className="text-sm text-gray-500 mb-4">
          Choisissez une boutique ci-dessus pour gérer vos produits.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-full flex justify-center mb-4">
          <img src="/boutique.webp" alt="Aucune boutique" className="w-40 h-auto opacity-90" />
        </div>
        <div className="mb-4">
          <ArrowRight className="h-8 w-8 text-red-500 animate-bounce" />
        </div>
        <Button
          variant="secondary"
          onClick={onAjouterProduit}
        >
          Créer une boutique
        </Button>
      </div>
    </>
  );

  const renderProduits = () => (
    <>
      <div>
        <Title level={3}>Mes produits</Title>
        <p className="text-sm text-gray-500 mb-4">Catalogue</p>
      </div>

      {produitsLoading && <p>Chargement des produits...</p>}

      {produitsError && <p className="text-red-600">Erreur : {produitsError}</p>}

      {!produitsLoading && !produitsError && (
        <>
          {produits.length === 0 ? (
            <p className="text-gray-600">Aucun produit pour cette boutique.</p>
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
            onClick={onAjouterProduit}
          >
            Ajouter un produit
          </Button>
        </>
      )}
    </>
  );

  return <Card className="p-4">{hasBoutique ? renderProduits() : renderNoBoutique()}</Card>;
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