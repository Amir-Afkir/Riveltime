import { X, Trash2, Save } from "lucide-react";
import { useRef } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

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
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">
            {data._id ? "Modifier" : "Créer"} {isBoutique ? "une boutique" : `un produit${boutique ? ` dans « ${boutique.name} »` : ""}`}
          </h3>
          <div className="flex gap-2">
            {isBoutique && data._id && (
              <Button
                onClick={onDelete}
                aria-label="Supprimer la boutique"
                className="p-2.5 border border-red-200 text-red-500 bg-red-50/40 hover:bg-red-100 transition rounded-xl"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <button
              onClick={onClose}
              aria-label="Fermer la fenêtre"
              className="p-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="w-5 h-5" />
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
              className="block w-full text-sm text-gray-800 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border file:border-gray-300 file:font-semibold file:bg-neutral-50 file:text-black hover:file:bg-neutral-100 file:cursor-pointer file:leading-tight file:focus-visible:outline-none file:focus-visible:ring-2 file:focus-visible:ring-primary transition mb-3"
            />
            <p className="text-xs text-gray-500 mt-1 mb-3">Image JPG ou PNG, max 2 Mo</p>
          </>
        )}

        {isProduit && (
          <>
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

            <Input label="Nom" name="name" aria-label="Nom" value={safeValue(data.name)} onChange={onChange} />
            <Input label="Prix" name="price" type="number" aria-label="Prix" value={safeValue(data.price, "")} onChange={onChange} />

            <Input label="Description" name="description" aria-label="Description" value={safeValue(data.description)} onChange={onChange} />
            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2" htmlFor="image">Image</label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              aria-label="Image"
              className="block w-full text-sm text-gray-800 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border file:border-gray-300 file:font-semibold file:bg-neutral-50 file:text-black hover:file:bg-neutral-100 file:cursor-pointer file:leading-tight file:focus-visible:outline-none file:focus-visible:ring-2 file:focus-visible:ring-primary transition"
            />
          </>
        )}

        <div className="mt-6 border-t pt-4">
          <Button onClick={onSave} aria-label="Sauvegarder" variant="secondary">
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
}