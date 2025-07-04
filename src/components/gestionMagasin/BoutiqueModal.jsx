import Card from "../../components/ui/Card";
import Title from "../../components/ui/Title";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const CATEGORIES = [
  "Alimentation",
  "Mobilité électrique",
  "Prêt-à-porter",
  "Électronique",
  "Beauté & Bien-être",
  "Maison & Déco",
];

export default function BoutiqueModal({
  boutique,
  onChange,
  onFileChange,
  onSave,
  onDelete,
  onClose,
}) {
  return (
    <div className="modal">
      <Card className="p-4">
        <Title level={3}>{boutique._id ? "Modifier" : "Créer"} une boutique</Title>
        <Input
          label="Nom de la boutique"
          name="name"
          value={boutique.name}
          onChange={onChange}
        />
        <label className="block mt-4 font-semibold">Catégorie</label>
        <select
          name="category"
          value={boutique.category}
          onChange={onChange}
          className="w-full border rounded px-3 py-2 mt-1"
        >
          <option value="">-- Sélectionner une catégorie --</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {boutique.coverImageUrl && (
          <img
            src={boutique.coverImageUrl}
            alt="Image de couverture boutique"
            className="w-full h-40 object-cover rounded mt-2"
          />
        )}
        <Input
          label="Image de couverture"
          name="coverImage"
          type="file"
          accept="image/*"
          onChange={onFileChange}
        />
        <Button className="mt-4" variant="success" onClick={onSave}>
          Sauvegarder la boutique
        </Button>
        {boutique._id && (
          <Button className="mt-2" variant="danger" onClick={onDelete}>
            Supprimer la boutique
          </Button>
        )}
        <Button className="mt-2" onClick={onClose}>
          Annuler
        </Button>
      </Card>
    </div>
  );
}
