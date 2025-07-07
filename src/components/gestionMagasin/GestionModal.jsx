import { X, Trash2, Save } from "lucide-react";
import { useRef } from "react";
import Input from "../ui/Input";

const safeValue = (val, fallback = "") => (val === undefined || val === null ? fallback : val);

const CATEGORIES = [
  "Alimentation",
  "Mobilité électrique",
  "Prêt-à-porter",
  "Électronique",
  "Beauté & Bien-être",
  "Maison & Déco",
];

export default function GestionModal({
  type,
  data,
  boutique, // utile uniquement pour type === "produit"
  onChange,
  onFileChange,
  onSave,
  onDelete,
  onClose,
  categories = [],
  collectionsDispo = []
}) {
  const modalRef = useRef();

  const isBoutique = type === "boutique";
  const isProduit = type === "produit";

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-screen-sm md:max-w-screen-md bg-white rounded-t-2xl rounded-b-none px-4 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto"      >
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">
            {data._id ? "Modifier" : "Créer"} {isBoutique ? "une boutique" : `un produit${boutique ? ` dans « ${boutique.name} »` : ""}`}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={onClose}
              title="Annuler"
              className="p-2 rounded-xl hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            {isBoutique && data._id && (
              <button
                onClick={onDelete}
                title="Supprimer"
                className="p-2 rounded-xl hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            )}
            <button
              onClick={onSave}
              title="Sauvegarder"
              className="p-2 rounded-xl hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 transition"
            >
              <Save className="w-5 h-5 text-green-600" />
            </button>
          </div>
        </div>

        {isBoutique && (
          <>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
              Nom de la boutique
            </label>
            <input
              id="name"
              name="name"
              type="text"
              aria-label="Nom de la boutique"
              value={safeValue(data.name)}
              onChange={onChange}
              className="w-full px-4 py-2.5 border rounded-xl shadow-sm text-base text-gray-800 focus-visible:ring-2 focus-visible:ring-primary focus:border-primary mb-3"
            />
            <label className="block mb-3 font-medium text-sm text-gray-700">Catégorie</label>
            <select
              name="category"
              aria-label="Catégorie"
              value={safeValue(data.category)}
              onChange={onChange}
              className="w-full border rounded-xl px-4 py-2.5 text-base text-gray-800 mb-3 focus-visible:ring-2 focus-visible:ring-primary focus:border-primary"
            >
              <option value="">-- Sélectionner une catégorie --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-3">
              Image de couverture
            </label>
            <input
              id="coverImage"
              name="coverImage"
              type="file"
              accept="image/*"
              aria-label="Image de couverture"
              onChange={onFileChange}
              className="w-full text-base text-gray-800 mb-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-[#d12e47]"
            />
            <p className="text-xs text-gray-500 mt-1 mb-3">Image JPG ou PNG, max 2 Mo</p>
          </>
        )}

        {isProduit && (
          <>
            <Input label="Nom" name="name" aria-label="Nom" value={safeValue(data.name)} onChange={onChange} />
            <Input label="Prix" name="price" type="number" aria-label="Prix" value={safeValue(data.price, "")} onChange={onChange} />

            <label className="block mt-4 mb-3 font-semibold text-sm text-gray-700">Collection</label>
            <input
              list="collections"
              name="collectionName"
              aria-label="Collection"
              value={safeValue(data.collectionName)}
              onChange={onChange}
              className="w-full border rounded-xl px-4 py-2.5 mt-1 mb-3 text-base text-gray-800 focus-visible:ring-2 focus-visible:ring-primary focus:border-primary"
            />
            <datalist id="collections">
              {collectionsDispo.map((col) => (
                <option key={col} value={col} />
              ))}
            </datalist>

            <Input label="Description" name="description" aria-label="Description" value={safeValue(data.description)} onChange={onChange} />
            <Input label="Image" name="image" type="file" aria-label="Image" accept="image/*" onChange={onFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-[#d12e47]" />
          </>
        )}
      </div>
    </div>
  );
}