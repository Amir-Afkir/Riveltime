import { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Title from "./ui/Title";

export default function BoutiqueForm({ initialData = {}, onSubmit }) {
  const [boutique, setBoutique] = useState({
    nom: "",
    categorie: "",
    email: "",
    telephone: "",
    adresse: "",
    codePostal: "",
    ville: "",
    horaires: "",
    siret: "",
    raisonSociale: "",
    siteWeb: "",
    description: "",
    moyensPaiement: [],
    disponible: true,
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "disponible") {
      setBoutique((prev) => ({ ...prev, disponible: checked }));
    } else {
      setBoutique((prev) => ({ ...prev, [name]: value }));
    }
  };

  const togglePaiement = (moyen) => {
    setBoutique((prev) => {
      const exists = prev.moyensPaiement.includes(moyen);
      return {
        ...prev,
        moyensPaiement: exists
          ? prev.moyensPaiement.filter((m) => m !== moyen)
          : [...prev.moyensPaiement, moyen],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(boutique);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title="Informations de la boutique">
        <Input label="Nom de la boutique" name="nom" value={boutique.nom} onChange={handleChange} required />
        <Input label="Catégorie" name="categorie" value={boutique.categorie} onChange={handleChange} required />
        <Input label="Email" name="email" type="email" value={boutique.email} onChange={handleChange} required />
        <Input label="Téléphone" name="telephone" value={boutique.telephone} onChange={handleChange} />
        <Input label="Adresse" name="adresse" value={boutique.adresse} onChange={handleChange} required />
        <Input label="Code postal" name="codePostal" value={boutique.codePostal} onChange={handleChange} />
        <Input label="Ville" name="ville" value={boutique.ville} onChange={handleChange} />
        <Input label="Horaires" name="horaires" value={boutique.horaires} onChange={handleChange} />
        <Input label="SIRET" name="siret" value={boutique.siret} onChange={handleChange} required />
        <Input label="Raison sociale" name="raisonSociale" value={boutique.raisonSociale} onChange={handleChange} />
        <Input label="Site web (optionnel)" name="siteWeb" value={boutique.siteWeb} onChange={handleChange} />
        <Input label="Description" name="description" value={boutique.description} onChange={handleChange} />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Moyens de paiement acceptés</label>
          <div className="flex gap-2 flex-wrap">
            {["CB", "Espèces", "Apple Pay", "Google Pay", "Ticket resto"].map((moyen) => (
              <label key={moyen} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={boutique.moyensPaiement.includes(moyen)}
                  onChange={() => togglePaiement(moyen)}
                />
                {moyen}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="disponible"
            checked={boutique.disponible}
            onChange={handleChange}
          />
          <span className="text-sm">Boutique visible en ligne</span>
        </div>
      </Card>

      <Button type="submit">💾 Enregistrer ma boutique</Button>
    </form>
  );
}