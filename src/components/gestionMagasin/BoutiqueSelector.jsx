import { Plus, Pencil } from "lucide-react";
import PropTypes from "prop-types";

export default function BoutiqueSelector({ boutiques, selectedId, onSelect, onCreate, onEdit }) {
  const isSelectionActive = !!selectedId;

  return (
    <div
      className={`relative mt-4 pb-2 px-4 ${
        isSelectionActive ? "flex flex-col items-center gap-4" : "flex gap-4 overflow-x-auto"
      } transition-all duration-300`}
    >
      {(isSelectionActive
        ? boutiques.filter((b) => b._id === selectedId)
        : [...boutiques, { isPlaceholder: true }]
      ).map((b, index) => {
        const isActive = selectedId === b._id;

        // Bouton "+"
        if (b.isPlaceholder) {
          return (
            <div
              key="add-boutique"
              className="relative w-[88px] h-[88px] flex-shrink-0 rounded-xl overflow-hidden border border-dashed border-gray-300 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center"
              aria-label="Ajouter une boutique"
            >
              <button
                onClick={onCreate}
                className="w-full h-full flex items-center justify-center"
              >
                <Plus size={24} className="text-gray-500 hover:text-primary transition-all" strokeWidth={2} />
              </button>
            </div>
          );
        }

        // Boutique card
        return (
          <div key={b._id} className="relative w-full max-w-3xl transition-all duration-500">
            <button
              onClick={() => onSelect(b)}
              className={`relative w-full ${
                isActive ? "aspect-video ring-2 ring-primary text-lg" : "w-[88px] h-[88px] text-sm"
              } border-white border-2 rounded-xl overflow-hidden shadow-lg ring-1 transition-transform transform hover:scale-[1.02]`}
              style={{
                backgroundImage: b.coverImageUrl ? `url(${b.coverImageUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-2 text-white font-semibold">
                {b.name}
              </span>
            </button>

            {isActive && (
              <>
                <button
                  onClick={() => onSelect(null)}
                  className="absolute top-2 left-2 bg-white/80 text-gray-800 rounded-full p-1 shadow hover:bg-gray-100 transition"
                  aria-label="Retour"
                >
                  ←
                </button>
                <button
                  onClick={() => onEdit(b)}
                  className="absolute top-2 right-2 bg-white/80 text-gray-800 rounded-full p-1 shadow hover:bg-gray-100 transition"
                  aria-label="Modifier"
                >
                  <Pencil size={18} className="text-gray-700 hover:text-primary transition-all" strokeWidth={2} />
                </button>
              </>
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