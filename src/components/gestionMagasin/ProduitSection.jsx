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

  const renderProduits = () => (
    <>
      <div className="mb-6 text-center">
        <Title level={3}>Mes produits</Title>
        <p className="text-sm text-gray-500">Catalogue</p>
      </div>

      {produitsLoading && <p>Chargement des produits...</p>}

      {produitsError && <p className="text-red-600">Erreur : {produitsError}</p>}

      {!produitsLoading && !produitsError && (
        <>
          {produits.length === 0 ? (
            <p className="text-gray-600 text-center">Aucun produit pour cette boutique.</p>
          ) : (
            <ul>
              {produits.map((prod) => (
                <li key={prod._id} className="flex items-center bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl p-4 mb-3">
                  <div className="w-14 h-14 mr-4 rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center">
                    {prod.imageUrl ? (
                      <img src={prod.imageUrl} alt={prod.name} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-xl text-gray-400">🧸</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[17px] font-semibold text-gray-900 leading-tight">{prod.name}</p>
                    <p className="text-[15px] text-gray-500">{prod.price} €</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onModifierProduit(prod)}
                      className="p-2 bg-[#ffe4e6] rounded-xl hover:bg-[#ffd2d7] transition-all shadow-sm"
                    >
                      <Pencil className="w-5 h-5 text-[#ed354f]" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Supprimer ce produit ?')) {
                          onSupprimerProduit(prod._id);
                        }
                      }}
                      className="p-2 bg-[#ffe4e6] rounded-xl hover:bg-[#ffd2d7] transition-all shadow-sm"
                    >
                      <svg className="w-5 h-5 text-[#ed354f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Button
            onClick={onAjouterProduit}
            variant="secondary"
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
  onAjouterBoutique: PropTypes.func.isRequired,
};