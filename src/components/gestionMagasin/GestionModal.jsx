import { X, Trash2, Save } from "lucide-react";
import { useRef } from "react";
import Input from "../ui/Input";

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
        className="w-full max-w-md md:max-w-lg bg-white rounded-t-2xl rounded-b-none px-4 py-5 shadow-lg animate-slide-up"
      >
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h3 className="text-base md:text-lg font-semibold">
            {data._id ? "Modifier" : "Créer"} {isBoutique ? "une boutique" : `un produit${boutique ? ` dans « ${boutique.name} »` : ""}`}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={onClose}
              title="Annuler"
              className="p-1.5 rounded hover:bg-gray-100 transition"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            {isBoutique && data._id && (
              <button
                onClick={onDelete}
                title="Supprimer"
                className="p-1.5 rounded hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
            <button
              onClick={onSave}
              title="Sauvegarder"
              className="p-1.5 rounded hover:bg-green-50 transition"
            >
              <Save className="w-4 h-4 text-green-600" />
            </button>
          </div>
        </div>

        {isBoutique && (
          <>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la boutique
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={data.name}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            />
            <label className="block mb-1 font-medium text-sm text-gray-700">Catégorie</label>
            <select
              name="category"
              value={data.category}
              onChange={onChange}
              className="w-full border rounded-md px-3 py-2 text-sm mb-4"
            >
              <option value="">-- Sélectionner une catégorie --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
              Image de couverture
            </label>
            <input
              id="coverImage"
              name="coverImage"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="w-full text-sm"
            />
            <p className="text-xs text-gray-500 mt-1 mb-1">Image JPG ou PNG, max 2 Mo</p>
          </>
        )}

        {isProduit && (
          <>
            <Input label="Nom" name="name" value={data.name} onChange={onChange} />
            <Input label="Prix" name="price" type="number" value={data.price} onChange={onChange} />

            <label className="block mt-4 font-semibold text-sm">Collection</label>
            <input
              list="collections"
              name="collectionName"
              value={data.collectionName || ""}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 mt-1 mb-4 text-sm"
            />
            <datalist id="collections">
              {collectionsDispo.map((col) => (
                <option key={col} value={col} />
              ))}
            </datalist>

            <Input label="Description" name="description" value={data.description} onChange={onChange} />
            <Input label="Image" name="image" type="file" accept="image/*" onChange={onFileChange} />
          </>
        )}
      </div>
    </div>
  );
}