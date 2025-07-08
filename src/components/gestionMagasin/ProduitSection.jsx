import PropTypes from "prop-types";
import { PackagePlus } from "lucide-react";

import Card from "../../components/ui/Card";
import Title from "../../components/ui/Title";
import Button from "../../components/ui/Button";
import ProduitListe from "./ProduitListe";

export default function ProduitSection({
  produits,
  produitsLoading,
  produitsError,
  boutique,
  onAjouterProduit,
  onModifierProduit,
  onSupprimerProduit,
  onAjouterBoutique,
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
        <Button
          variant="secondary"
          onClick={onAjouterBoutique}
        >
          Créer une boutique
        </Button>
      </div>
    </>
  );

  const renderProduits = () => {
    const produitsParCollection = produits.reduce((acc, produit) => {
      const key = produit.collectionName || "Sans collection";
      acc[key] = acc[key] || [];
      acc[key].push(produit);
      return acc;
    }, {});

    return (
      <>
        {produitsLoading && <p>Chargement des produits...</p>}
        {produitsError && <p className="text-red-600">Erreur : {produitsError}</p>}

        {!produitsLoading && !produitsError && (
          <>
            {produits.length === 0 ? (
              <p className="text-gray-600 text-center">Aucun produit pour cette boutique.</p>
            ) : (
              Object.entries(produitsParCollection).map(([collection, produitsGroupe]) => (
                <ProduitListe
                  key={collection}
                  collectionName={collection}
                  produits={produitsGroupe}
                  onModifier={onModifierProduit}
                  onSupprimer={onSupprimerProduit}
                />
              ))
            )}

            {/* 
            <Button
              onClick={onAjouterProduit}
              variant="secondary"
            >
              Ajouter un produit
            </Button>
            */}
          </>
        )}
      </>
    );
  };

  return (
    <>
      {hasBoutique && (
        <section className="mt-0 mb-6 text-center">
          <Title level={3} className="text-xl font-semibold leading-tight text-black">
            {boutique?.name ? `${boutique.name}` : "Votre boutique"}
          </Title>
          <p className="text-sm text-black/80">
            Ajoutez ou gérez vos produits en quelques clics.
          </p>
        </section>
      )}
      <Card className="p-4">{hasBoutique ? renderProduits() : renderNoBoutique()}</Card>

      {hasBoutique && (
        <button
          onClick={onAjouterProduit}
          className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] right-5 z-10 bg-[#ed354f] bg-opacity-100 text-white w-[56px] h-[56px] flex items-center justify-center rounded-full shadow-xl hover:bg-primary/90 active:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
          aria-label="Ajouter un produit"
          title="Ajouter un produit"
        >
          <PackagePlus className="w-7 h-7 text-white" />
        </button>
      )}
    </>
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
  onAjouterBoutique: PropTypes.func.isRequired,
};