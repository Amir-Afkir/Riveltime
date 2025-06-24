import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Title from "../ui/Title";
import defaults from '@shared/userDefaults.json';
const { clientDefaults, vendeurDefaults, livreurDefaults } = defaults;
const isLocalhost = window.location.hostname === "localhost";

export default function UserForm({ role, initialData = {}, onSubmit }) {
  const getDefaultFormData = () => {
    return {
      fullname: initialData.fullname || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      kbis: initialData.kbis || "",
      raisonSociale: initialData.raisonSociale || "",
      notifications: initialData.notifications ?? true,
      infosClient: { ...clientDefaults, ...initialData.infosClient },
      infosVendeur: { ...vendeurDefaults, ...initialData.infosVendeur },
      infosLivreur: { ...livreurDefaults, ...initialData.infosLivreur },
    };
  };

  const [formData, setFormData] = useState(getDefaultFormData());

  // Adresse autocomplete states for vendeur
  const [adresseQuery, setAdresseQuery] = useState(formData.infosVendeur.adresseComplete || "");
  const [adresseSuggestions, setAdresseSuggestions] = useState([]);
  const [adresseError, setAdresseError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (adresseQuery.length > 2) {
        fetch(`/api/address/search?q=${encodeURIComponent(adresseQuery)}`)
          .then((res) => res.json())
          .then((results) => {
            setAdresseSuggestions(results);
            setAdresseError(results.length ? '' : 'Aucune suggestion trouvée');
          })
          .catch((err) => {
            console.error(err);
            setAdresseError('Erreur de recherche');
          });
      }
    }, 500); // 500ms de délai
  
    return () => clearTimeout(timeout);
  }, [adresseQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in formData) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      const [scope, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [scope]: {
          ...prev[scope],
          [field]: value,
        },
      }));
    }
  };

  // Adresse autocomplete handlers for vendeur
  const handleAdresseChange = (e) => {
    const value = e.target.value;
    setAdresseQuery(value);
    setFormData((prev) => ({
      ...prev,
      infosVendeur: {
        ...prev.infosVendeur,
        adresseComplete: value,
        latitude: null,
        longitude: null,
      },
    }));
  };

  const handleSelectAdresse = (suggestion) => {
    setAdresseQuery(suggestion.display_name);
    setAdresseSuggestions([]);
    setAdresseError("");
    setFormData((prev) => ({
      ...prev,
      infosVendeur: {
        ...prev.infosVendeur,
        adresseComplete: suggestion.display_name,
        latitude: parseFloat(suggestion.lat),
        longitude: parseFloat(suggestion.lon),
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <Card>
        <Input
          label="Nom complet"
          name="fullname"
          value={formData.fullname}
          onChange={handleChange}
          required
        />
        <Input
          label="Téléphone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />

        {role === "client" && (
          <>
            <Input
              label="Adresse complète"
              name="infosClient.adresseComplete"
              value={formData.infosClient.adresseComplete}
              onChange={handleChange}
            />
          </>
        )}

        {role === "vendeur" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                name="infosVendeur.categorie"
                value={formData.infosVendeur.categorie}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1"
              >
                <option value="">-- Sélectionnez une catégorie --</option>
                <option value="Alimentation">Alimentation</option>
                <option value="Mobilité électrique">Mobilité électrique</option>
                <option value="Prêt-à-porter">Prêt-à-porter</option>
                <option value="Informatique">Informatique</option>
                <option value="Restaurant / Traiteur">Restaurant / Traiteur</option>
                <option value="Pharmacie / Santé">Pharmacie / Santé</option>
                <option value="Bricolage / Maison">Bricolage / Maison</option>
                <option value="Fleuriste / Jardin">Fleuriste / Jardin</option>
              </select>
            </div>
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-2 py-1"
                value={adresseQuery}
                onChange={handleAdresseChange}
                placeholder="Saisissez une adresse"
              />
              {adresseSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full border rounded bg-white shadow mt-1 max-h-40 overflow-y-auto text-sm">
                  {adresseSuggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelectAdresse(s)}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
              {adresseError && <p className="text-red-500 text-sm mt-1">{adresseError}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Moyens de paiement</label>
              <div className="flex gap-2 flex-wrap">
                {["CB", "Espèces", "Apple Pay", "Google Pay", "Ticket resto"].map((moyen) => (
                  <label key={moyen} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.infosVendeur.moyensPaiement.includes(moyen)}
                      onChange={() =>
                        setFormData((prev) => {
                          const exists = prev.infosVendeur.moyensPaiement.includes(moyen);
                          return {
                            ...prev,
                            infosVendeur: {
                              ...prev.infosVendeur,
                              moyensPaiement: exists
                                ? prev.infosVendeur.moyensPaiement.filter((m) => m !== moyen)
                                : [...prev.infosVendeur.moyensPaiement, moyen],
                            },
                          };
                        })
                      }
                    />
                    {moyen}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {role === "livreur" && (
          <>
            <Input
              label="Type de transport"
              name="infosLivreur.typeDeTransport"
              value={formData.infosLivreur.typeDeTransport}
              onChange={handleChange}
            />
            <Input
              label="Raison sociale"
              name="raisonSociale"
              value={formData.raisonSociale}
              onChange={handleChange}
            />
            <Input
              label="Extrait Kbis"
              name="kbis"
              value={formData.kbis}
              onChange={handleChange}
            />
            <Input
              label="SIRET"
              name="infosLivreur.siret"
              value={formData.infosLivreur.siret}
              onChange={handleChange}
            />
            <Input
              label="Zone de livraison"
              name="infosLivreur.zone"
              value={formData.infosLivreur.zone}
              onChange={handleChange}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="infosLivreur.disponible"
                checked={formData.infosLivreur.disponible}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    infosLivreur: {
                      ...prev.infosLivreur,
                      disponible: e.target.checked,
                    },
                  }))
                }
              />
              <span className="text-sm">Profil visible</span>
            </div>
          </>
        )}
      </Card>

      <Button type="submit">💾 Enregistrer mes informations</Button>
    </form>
  );
}