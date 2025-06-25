import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
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

  // Adresse autocomplete states for vendeur and client
  const [adresseQuery, setAdresseQuery] = useState("");
  const [adresseSuggestions, setAdresseSuggestions] = useState([]);
  const [adresseError, setAdresseError] = useState("");
  const [adresseScope, setAdresseScope] = useState(null);

useEffect(() => {
  if (!adresseScope) {
    setAdresseSuggestions([]);
    setAdresseError("");
    return;
  }
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
    } else {
      setAdresseSuggestions([]);
      setAdresseError("");
    }
  }, 500); // 500ms de délai

  return () => clearTimeout(timeout);
}, [adresseQuery, adresseScope]);

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

  // Adresse autocomplete handlers for vendeur and client
  const handleAdresseChange = (e, scope) => {
    const value = e.target.value;
    setAdresseQuery(value);
    setAdresseScope(scope);
    setFormData((prev) => ({
      ...prev,
      [scope]: {
        ...prev[scope],
        adresseComplete: value,
        latitude: null,
        longitude: null,
      },
    }));
  };

  const handleSelectAdresse = (suggestion) => {
    if (!adresseScope) return;
    setAdresseQuery(suggestion.display_name);
    setAdresseSuggestions([]);
    setAdresseError("");
    setFormData((prev) => ({
      ...prev,
      [adresseScope]: {
        ...prev[adresseScope],
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
    <div className="px-4">
      <form onSubmit={handleSubmit} className="space-y-4 w-full px-4 py-4">
        <div>
          <div className="mb-4">
            <Input
              label="Nom complet"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <Input
              label="Téléphone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {role === "client" && (
            <>
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={adresseScope === "infosClient" ? adresseQuery : formData.infosClient.adresseComplete}
                  onChange={(e) => handleAdresseChange(e, "infosClient")}
                  placeholder="Saisissez une adresse"
                />
                {adresseScope === "infosClient" && adresseSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white mt-1 max-h-40 overflow-y-auto text-sm">
                    {adresseSuggestions.map((s, i) => (
                      <li
                        key={i}
                        onClick={() => handleSelectAdresse(s)}
                        className="hover:bg-gray-100 cursor-pointer"
                      >
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
                {adresseScope === "infosClient" && adresseError && (
                  <p className="text-red-500 text-sm mt-1">{adresseError}</p>
                )}
              </div>
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
                  className="w-full border border-gray-300 rounded px-3 py-2"
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
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={adresseScope === "infosVendeur" ? adresseQuery : formData.infosVendeur.adresseComplete}
                  onChange={(e) => handleAdresseChange(e, "infosVendeur")}
                  placeholder="Saisissez une adresse"
                />
                {adresseScope === "infosVendeur" && adresseSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white mt-1 max-h-40 overflow-y-auto text-sm">
                    {adresseSuggestions.map((s, i) => (
                      <li
                        key={i}
                        onClick={() => handleSelectAdresse(s)}
                        className="hover:bg-gray-100 cursor-pointer"
                      >
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
                {adresseScope === "infosVendeur" && adresseError && <p className="text-red-500 text-sm mt-1">{adresseError}</p>}
              </div>
            </>
          )}

          {role === "livreur" && (
            <>
              <div className="mb-4">
                <Input
                  label="Type de transport"
                  name="infosLivreur.typeDeTransport"
                  value={formData.infosLivreur.typeDeTransport}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Input
                  label="Raison sociale"
                  name="raisonSociale"
                  value={formData.raisonSociale}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Input
                  label="Extrait Kbis"
                  name="kbis"
                  value={formData.kbis}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Input
                  label="SIRET"
                  name="infosLivreur.siret"
                  value={formData.infosLivreur.siret}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Input
                  label="Zone de livraison"
                  name="infosLivreur.zone"
                  value={formData.infosLivreur.zone}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4 flex items-center gap-2">
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
        </div>

        <Button type="submit">💾 Enregistrer mes informations</Button>
      </form>
    </div>
  );
}