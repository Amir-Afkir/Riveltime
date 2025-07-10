// ✅ ProfilCommun.jsx

// 🛠️ Imports React et hooks
import { useState, useRef, useEffect, useMemo } from "react";

// 🛠️ Portail
import { createPortal } from "react-dom";

// 🛠️ Composants internes
import NotificationBanner from "../../components/ui/NotificationBanner";
import AvatarHeader from "../../components/profile/AvatarHeader";
import InfoCard from "../../components/profile/InfoCard";
import UserFieldCard from "../../components/profile/UserFieldCard";
import ToggleSwitch from "../../components/profile/ToggleSwitch";

// 🛠️ Icônes externes
import { User, Mail, Phone, MapPin, Truck, Pencil, CheckCircle } from "lucide-react";

// 🛠️ Context
import { useUser } from "../../context/UserContext";

// 🪟 AddressSuggestionsPortal (portail suggestions d'adresse)
function AddressSuggestionsPortal({ suggestions, onSelect, inputRef }) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, [inputRef, suggestions]);

  if (!suggestions.length || !position) return null;

  return createPortal(
    <ul
      className="bg-white border border-gray-300 rounded shadow max-h-48 overflow-auto z-[9999]"
      style={{
        position: "absolute",
        top: `calc(${position.top}px - env(safe-area-inset-top, 0px))`,
        left: position.left,
        width: position.width,
      }}
    >
      {suggestions.map((sug) => (
        <li
          key={sug.properties.id}
          className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(sug.properties.label, sug.geometry.coordinates);
          }}
        >
          {sug.properties.label}
        </li>
      ))}
    </ul>,
    document.body
  );
}


export default function ProfilCommun({ isLoading }) {
  // 🧠 Hooks d'état
  const { userData: user, loadingUser: loading, refreshUser, logout, deleteAccount } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notif, setNotif] = useState({ message: "", type: "success" });
  const [editableData, setEditableData] = useState({
    fullname: user?.fullname || "",
    phone: user?.phone || "",
    adresseComplete: (user?.infosClient?.adresseComplete || user?.infosVendeur?.adresseComplete) || "",
    typeDeTransport: user?.infosLivreur?.typeDeTransport || "",
    latitude: user?.infosClient?.latitude || user?.infosVendeur?.latitude || null,
    longitude: user?.infosClient?.longitude || user?.infosVendeur?.longitude || null,
  });
  const [adresseSuggestions, setAdresseSuggestions] = useState([]);

  // 🧠 Références DOM
  const adresseInputRef = useRef(null);

  // 🧠 Calculs dérivés (profil, complétion)
  const {
    fullname,
    email,
    phone,
    role,
    notifications,
    infosClient,
    infosVendeur,
    infosLivreur
  } = useMemo(() => user || {}, [user]);

  const profilCompletion = useMemo(() => {
    let filled = 0;
    if (fullname) filled++;
    if (phone) filled++;
    if (role === "client" && infosClient?.adresseComplete) filled++;
    if (role === "vendeur") {
      if (infosVendeur?.adresseComplete) filled++;
    }
    if (role === "livreur" && infosLivreur?.typeDeTransport) filled++;
    const max = role === "vendeur" ? 3 : 3;
    return Math.round((filled / max) * 100);
  }, [fullname, phone, role, infosClient, infosVendeur, infosLivreur]);

  const profilIncomplet = useMemo(() => {
    if (role === "client") return !fullname || !phone || !infosClient?.adresseComplete;
    if (role === "vendeur") return !fullname || !phone || !infosVendeur?.adresseComplete;
    if (role === "livreur") return !fullname || !phone || !infosLivreur?.typeDeTransport;
    return false;
  }, [fullname, phone, role, infosClient, infosVendeur, infosLivreur]);

  // 🧠 Fonctions de gestion (update, edit)
  const handleUpdate = async (formData) => {
    try {
      setIsUpdating(true);
      const token = sessionStorage.getItem("accessToken");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      setNotif({ message: "Profil mis à jour avec succès !", type: "success" });
      if (typeof refreshUser === "function") await refreshUser({ silent: true });
    } catch (err) {
      console.error("❌", err);
      setNotif({ message: "❌ La mise à jour a échoué", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      if (
        (role === "client" || role === "vendeur") &&
        editableData.adresseComplete &&
        (editableData.latitude === null || editableData.longitude === null)
      ) {
        try {
          const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${editableData.adresseComplete}`);
          const data = await res.json();
          const best = data?.features?.[0];
          if (best) {
            editableData.latitude = best.geometry.coordinates[1];
            editableData.longitude = best.geometry.coordinates[0];
          } else {
            setNotif({
              message: "❌ Adresse non trouvée. Veuillez saisir une adresse plus précise ou en choisir une dans les suggestions.",
              type: "error",
            });
            return;
          }
        } catch (err) {
          console.error("Géocodage échoué :", err);
          setNotif({
            message: "❌ Erreur de géocodage. Vérifiez votre connexion internet.",
            type: "error",
          });
          return;
        }
      }

      const updatedUser = {
        ...user,
        fullname: editableData.fullname,
        phone: editableData.phone,
        infosClient: role === "client"
          ? {
              ...infosClient,
              adresseComplete: editableData.adresseComplete,
              latitude: editableData.latitude,
              longitude: editableData.longitude,
            }
          : infosClient,
        infosVendeur: role === "vendeur"
          ? {
              ...infosVendeur,
              adresseComplete: editableData.adresseComplete,
              latitude: editableData.latitude,
              longitude: editableData.longitude,
            }
          : infosVendeur,
        infosLivreur: role === "livreur"
          ? {
              ...infosLivreur,
              typeDeTransport: editableData.typeDeTransport,
            }
          : infosLivreur,
      };
      await handleUpdate(updatedUser);
    } else {
      setEditableData({
        fullname: fullname || "",
        phone: phone || "",
        adresseComplete: infosClient?.adresseComplete || infosVendeur?.adresseComplete || "",
        typeDeTransport: infosLivreur?.typeDeTransport || "",
        latitude: infosClient?.latitude || infosVendeur?.latitude || null,
        longitude: infosClient?.longitude || infosVendeur?.longitude || null,
      });
    }
    setIsEditing(!isEditing);
  };

  // if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Erreur : utilisateur introuvable</p>;

  // 📦 Données des sections
  const sections = [
    {
      key: "infos",
      title: "Mes informations",
      content: (
        <>
          {profilIncomplet && !isEditing && (
            <>
              <p className="bg-yellow-50 text-yellow-900 p-2 text-sm rounded border border-yellow-300 font-medium">
                ⚠️ Votre profil est incomplet. Veuillez le compléter.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${profilCompletion}%` }}
                />
              </div>
            </>
          )}
          <div className="space-y-3 px-1">
            {isEditing ? (
              <>
                <div className="flex items-center gap-2">
                  <User size={18} />
                  <input
                    type="text"
                    value={editableData.fullname}
                    onChange={(e) => setEditableData({ ...editableData, fullname: e.target.value })}
                    className="border border-gray-300 rounded px-2 py-1 w-full text-[16px]"
                    placeholder="Nom complet"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={18} />
                  <input
                    type="tel"
                    value={editableData.phone}
                    onChange={(e) => {
                      // Autoriser uniquement chiffres, +, espaces, tirets
                      const filteredValue = e.target.value.replace(/[^\d+ \-]/g, "");
                      setEditableData({ ...editableData, phone: filteredValue });
                    }}
                    pattern="^\+?[0-9\- ]{7,15}$"
                    title="Entrez un numéro de téléphone valide (7 à 15 chiffres, espaces et tirets autorisés)"
                    className="border border-gray-300 rounded px-2 py-1 w-full text-[16px]"
                    placeholder="Téléphone"
                  />
                </div>
                {role === "livreur" ? (
                  <div className="flex items-center gap-2">
                    <Truck size={18} />
                    <select
                      value={editableData.typeDeTransport}
                      onChange={(e) =>
                        setEditableData({ ...editableData, typeDeTransport: e.target.value })
                      }
                      className="border border-gray-300 rounded px-2 py-1 w-full text-[16px]"
                      required
                    >
                      <option value="">-- Choisissez un transport --</option>
                      <option value="vélo">Vélo</option>
                      <option value="scooter">Scooter</option>
                      <option value="voiture">Voiture</option>
                      <option value="camion">Camion</option>
                      <option value="à pied">À pied</option>
                    </select>
                  </div>
                ) : (
                  // Localisation de l'input adresse dans le bloc role !== "livreur"
                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    <input
                      type="text"
                      value={editableData.adresseComplete}
                      onChange={async (e) => {
                        const value = e.target.value;
                        setEditableData({
                          ...editableData,
                          adresseComplete: value,
                          latitude: null,
                          longitude: null,
                        });
                        if (value.length > 3) {
                          const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${value}`);
                          const data = await res.json();
                          setAdresseSuggestions(data.features || []);
                        } else {
                          setAdresseSuggestions([]);
                        }
                      }}
                      className="border border-gray-300 rounded px-2 py-1 w-full text-[16px]"
                      placeholder="Adresse complète"
                      autoComplete="off"
                      ref={adresseInputRef}
                    />
                    <AddressSuggestionsPortal
                      suggestions={adresseSuggestions}
                      onSelect={(label, coords) => {
                        setEditableData({
                          ...editableData,
                          adresseComplete: label,
                          latitude: coords[1],
                          longitude: coords[0],
                        });
                        setAdresseSuggestions([]);
                      }}
                      inputRef={adresseInputRef}
                    />
                  </div>
                )}
                {email && <UserFieldCard icon={<Mail size={18} />} value={email} />}
              </>
            ) : (
              <>
                {!profilIncomplet && <UserFieldCard icon={<User size={18} />} value={fullname} />}
                {email && <UserFieldCard icon={<Mail size={18} />} value={email} />}
                {!profilIncomplet && <UserFieldCard icon={<Phone size={18} />} value={phone} />}
                {(role === "client" && infosClient?.adresseComplete) ||
                (role === "vendeur" && infosVendeur?.adresseComplete) ? (
                  <UserFieldCard
                    icon={<MapPin size={18} />}
                    value={infosClient?.adresseComplete || infosVendeur?.adresseComplete}
                  />
                ) : null}
                {role === "livreur" && infosLivreur?.typeDeTransport && (
                  <UserFieldCard icon={<Truck size={18} />} value={infosLivreur.typeDeTransport} />
                )}
              </>
            )}
          </div>
        </>
      ),
      action: (
        <button
          onClick={handleEditToggle}
          className={
            isEditing
              ? "inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
              : "inline-flex items-center text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors duration-200"
          }
          aria-label={isEditing ? "Sauvegarder" : "Modifier"}
        >
          {isEditing ? <CheckCircle size={18} /> : <Pencil size={18} />}
          <span className="ml-1">{isEditing ? "Sauvegarder" : profilIncomplet ? "Compléter" : "Modifier"}</span>
        </button>
      ),
      cardClass: `bg-gray-50 shadow-md${profilIncomplet ? " border-l-4 border-yellow-400 bg-yellow-50" : ""}`,
    },
    {
      key: "notifications",
      title: "Notifications",
      content: <ToggleSwitch label="Recevoir les alertes e-mail" checked={notifications ?? false} role={role} />,
    },
    // Section "Moyens de paiement" supprimée
  ];

  // 🧩 Rendu
  return (
    <div className="relative z-10 pt-4">
      <AvatarHeader />
      {notif.message && (
        <NotificationBanner
          message={notif.message}
          type={notif.type}
          onClose={() => setNotif({ message: "", type: "success" })}
        />
      )}
      <div className="h-6" />
      <div className="space-y-6 px-4">
        {sections.map((section, index) => {
          // Nouveau style d'animation plus fluide et aspect iOS moderne
          const baseDelay = 40;
          const stagger = 60;
          const delay = baseDelay + index * stagger;
          return (
            <InfoCard
              key={section.key}
              title={section.title}
              action={section.action}
              delay={delay}
              className={
                (section.cardClass
                  ? section.cardClass
                  : "bg-white shadow-lg rounded-2xl border border-gray-100") +
                " transition-all duration-500"
              }
            >
              {section.content}
            </InfoCard>
          );
        })}

        <InfoCard
          title="Sécurité"
          className="bg-white shadow-lg rounded-xl border border-gray-100 transition-all duration-500"
          delay={40 + 4 * 60}
        >
          <div className="flex flex-col space-y-4">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${import.meta.env.VITE_API_URL}/account/password-reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user?.email }),
                  });

                  const result = await response.json();
                  if (!response.ok) throw new Error(result.error || "Erreur");

                  setNotif({ message: result.message || "Un email de réinitialisation a été envoyé à votre adresse.", type: "success" });
                } catch (err) {
                  console.error("❌", err);
                  setNotif({ message: "Erreur lors de l'envoi de l’email", type: "error" });
                }
              }}
              className="inline-flex items-center justify-start gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <span className="text-indigo-600">Modifier mon mot de passe</span>
            </button>

            <hr className="border-gray-200" />

            <button
              onClick={() => {
                logout({ returnTo: import.meta.env.VITE_BASE_URL });
              }}
              className="w-full bg-neutral-50 !text-black border border-gray-300 hover:bg-neutral-100 active:scale-[0.97] active:shadow-inner focus-visible:ring-2 focus-visible:ring-red-300 rounded-full flex items-center justify-center gap-2 py-2.5 text-[15px] transition-transform"
            >
              Déconnexion
            </button>

            <button
              onClick={deleteAccount}
              className="w-full bg-[#ed354f] text-white rounded-full hover:bg-[#d12e47] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#f58ba0] py-2.5 text-[15px] transition-all"
            >
              Supprimer mon profil
            </button>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}