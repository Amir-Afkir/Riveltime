import Card from "../../components/ui/Card";
import Title from "../../components/ui/Title";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function ProduitModal({ boutique, produit, onChange, onFileChange, onSave, onCancel, categories, collectionsDispo }) {
  return (
    <div className="modal">
      <Card className="p-4">
        <Title level={3}>{produit._id ? "Modifier" : "Ajouter"} un produit dans « {boutique.name} »</Title>
        <Input label="Nom" name="name" value={produit.name} onChange={onChange} />
        <Input label="Prix" name="price" type="number" value={produit.price} onChange={onChange} />
        <label className="block mt-4 font-semibold">Collection</label>
        <input
          list="collections"
          name="collectionName"
          value={produit.collectionName || ""}
          onChange={onChange}
          className="w-full border rounded px-3 py-2 mt-1"
        />
        <datalist id="collections">
          {collectionsDispo.map((col) => (
            <option key={col} value={col} />
          ))}
        </datalist>
        <Input label="Description" name="description" value={produit.description} onChange={onChange} />
        <Input label="Image" name="image" type="file" accept="image/*" onChange={onFileChange} />
        <Button onClick={onSave} variant="success" className="mt-4">
          {produit._id ? "Modifier" : "Ajouter"}
        </Button>
        <Button onClick={onCancel} className="mt-2">Annuler</Button>
      </Card>
    </div>
  );
}