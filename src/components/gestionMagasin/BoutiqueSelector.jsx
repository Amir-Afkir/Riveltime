import { Plus, Pencil } from "lucide-react";
import PropTypes from "prop-types";

export default function BoutiqueSelector({ boutiques, selectedId, onSelect, onCreate, onEdit }) {
  return (
    <div className="relative pb-2 overflow-x-auto flex gap-3 snap-x snap-mandatory scrollbar-hide flex-nowrap scroll-smooth">
      {selectedId
        ? (() => {
            const selectedBoutique = boutiques.find((b) => b._id === selectedId);
            if (!selectedBoutique) return null;
            return (
              <div className="relative w-full aspect-video flex-shrink-0 snap-center transition-all duration-500 ease-in-out scale-100 opacity-100" key={selectedBoutique._id}>
                <button
                  onClick={() => onSelect(null)}
                  className="relative w-full h-full rounded-xl overflow-hidden border-2 ring-2 ring-primary shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{
                    backgroundImage: selectedBoutique.coverImageUrl
                      ? `url(${selectedBoutique.coverImageUrl})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  aria-label={`Boutique ${selectedBoutique.name}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 left-2 text-white font-semibold text-sm truncate w-[80%]">
                    {selectedBoutique.name}
                  </span>
                </button>
                <button
                  onClick={() => onSelect(null)}
                  className="absolute top-2 left-2 bg-white/90 text-gray-800 rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Retour"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => onEdit(selectedBoutique)}
                  className="absolute top-2 right-2 bg-white/90 text-gray-800 rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Modifier"
                >
                  <Pencil size={16} className="text-gray-700" strokeWidth={2} />
                </button>
              </div>
            );
          })()
        : [...boutiques, { isPlaceholder: true }].map((b) => {
            const isActive = selectedId === b._id;

            if (b.isPlaceholder) {
              return (
                <button
                  key="add-boutique"
                  onClick={onCreate}
                  className="w-[96px] h-[96px] min-w-[96px] min-h-[96px] flex-shrink-0 rounded-xl overflow-hidden border border-dashed border-gray-300 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center snap-center focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Ajouter une boutique"
                >
                  <Plus size={24} className="text-gray-500" strokeWidth={2} />
                </button>
              );
            }

            return (
              <div
                key={b._id}
                className="relative w-[96px] h-[96px] flex-shrink-0 snap-center transition-all duration-300 ease-in-out"
              >
                <button
                  onClick={() => onSelect(isActive ? null : b)}
                  className={`relative w-full h-full rounded-xl overflow-hidden border-2 ${
                    isActive ? "ring-2 ring-primary" : "ring-0"
                  } shadow-md transition-transform duration-300 ease-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary`}
                  style={{
                    backgroundImage: b.coverImageUrl ? `url(${b.coverImageUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  aria-label={`Boutique ${b.name}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 left-2 text-white font-semibold text-sm truncate w-[80%]">
                    {b.name}
                  </span>
                </button>
                {/* No back button here */}
                {isActive && (
                  <button
                    onClick={() => onEdit(b)}
                    className="absolute top-2 right-2 bg-white/90 text-gray-800 rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Modifier"
                  >
                    <Pencil size={16} className="text-gray-700" strokeWidth={2} />
                  </button>
                )}
              </div>
            );
          })}
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