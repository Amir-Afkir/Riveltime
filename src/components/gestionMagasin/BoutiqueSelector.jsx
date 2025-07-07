import { Plus, Pencil } from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";

export default function BoutiqueSelector({ boutiques, selectedId, onSelect, onCreate, onEdit }) {
  const [shrinkingId, setShrinkingId] = useState(null);
  const [isDeselecting, setIsDeselecting] = useState(false);
  const selectedBoutique = selectedId ? boutiques.find((b) => b._id === selectedId) : null;

  // Render the selected boutique with detailed view and edit option
  const renderSelectedBoutique = () => {
    if (!selectedBoutique) return null;

    return (
      <div
        className={`relative w-full max-w-[250px] mx-auto rounded-xl overflow-hidden border-4 border-gray-100 ${
          isDeselecting ? 'animate-fade-shrink-out' : 'animate-expand-card'
        }`}
        key={selectedBoutique._id}
      >
        <div className="aspect-video w-full relative">
          <button
            onClick={() => {
              setIsDeselecting(true);
              setTimeout(() => {
                onSelect(null);
                setIsDeselecting(false);
              }, 100); // doit correspondre à la durée de l'animation CSS
            }}
            className="absolute inset-0 w-full h-full focus:outline-none"
            aria-label={`Désélectionner ${selectedBoutique.name}`}
          >
            <img
              src={selectedBoutique.coverImageUrl}
              alt={`Image de ${selectedBoutique.name}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        </div>
        <div className="bg-white text-center pt-3 pb-4 px-4">
          <div className="text-lg font-bold text-gray-900">{selectedBoutique.name}</div>
          <button
            onClick={() => onEdit(selectedBoutique)}
            className="text-xs text-primary mt-1 underline underline-offset-2"
          >
            Modifier la boutique
          </button>
        </div>
      </div>
    );
  };

  // Render a single boutique in the list of unselected boutiques
  const renderBoutique = (b) => {
    const isShrinking = shrinkingId === b._id;
    return (
      <div
        key={b._id}
        className={`flex flex-col items-center w-[96px] flex-shrink-0 snap-center transition-all duration-100 ease-in-out ${
          isShrinking ? 'animate-shrink-fade-out' : 'animate-expand-card'
        }`}
      >
        <button
          onClick={() => {
            setShrinkingId(b._id);
            setTimeout(() => {
              onSelect(b);
              setShrinkingId(null);
            }, 200); // attendre la fin de shrink
          }}
          className="relative w-full h-[96px] rounded-xl overflow-hidden border-4 ring-0 shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-transform duration-100 ease-out hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary"
          style={{
            backgroundImage: b.coverImageUrl ? `url(${b.coverImageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-label={`Boutique ${b.name}`}
        >
        </button>
        <span className="mt-2 text-center text-sm font-medium text-gray-800 truncate w-full">
          {b.name}
        </span>
      </div>
    );
  };

  return (
    <div className="relative py-3 px-4 overflow-x-auto flex gap-3 snap-x snap-mandatory scrollbar-hide flex-nowrap scroll-smooth">
      {selectedId
        ? renderSelectedBoutique()
        : boutiques.filter((b) => !b.isPlaceholder).map(renderBoutique)}

      {!selectedId && (
        <button
          key="add-boutique"
          onClick={onCreate}
          className="w-[96px] h-[96px] min-w-[96px] min-h-[96px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center snap-center shadow-[0_2px_6px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Ajouter une boutique"
        >
          <Plus size={24} className="text-gray-500" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

BoutiqueSelector.propTypes = {
  boutiques: PropTypes.array.isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};