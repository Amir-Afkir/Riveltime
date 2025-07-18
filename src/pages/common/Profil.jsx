// ✅ ProfilCommun.jsx

// 1. Imports externes React
import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

// 2. Bibliothèques tierces
import { User, Mail, Phone, MapPin, Truck, Pencil, CheckCircle } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

// 3. Composants internes
import NotificationBanner from "../../components/ui/NotificationBanner";
import AvatarHeader from "../../components/profile/AvatarHeader";
import InfoCard from "../../components/profile/InfoCard";
import UserFieldCard from "../../components/profile/UserFieldCard";
import ToggleSwitch from "../../components/profile/ToggleSwitch";
import Button from "../../components/ui/Button";
import StripePaiement from "../../components/profile/StripePaiement";
import ConfirmModal from "../../components/ui/ConfirmModal";

// 4. Stores et hooks personnalisés
import useUserStore from "../../stores/userStore";

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

// 🗂️ Constantes globales et helpers
// URL de l'API (pour éviter répétition)
const VITE_API_URL = import.meta.env.VITE_API_URL;

// Données éditables par défaut (pour useState et reset)
const defaultEditableData = {
  fullname: "",
  phone: "",
  adresseComplete: "",
  typeDeTransport: "",
  latitude: null,
  longitude: null,
};

// Fonction utilitaire pour géocoder une adresse via l'API gouvernementale
async function geocodeAdresse(adresse) {
  try {
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${adresse}`);
    const data = await res.json();
    const best = data?.features?.[0];
    if (best) {
      return {
        latitude: best.geometry.coordinates[1],
        longitude: best.geometry.coordinates[0],
      };
    }
    return null;
  } catch (err) {
    throw err;
  }
}

export default function ProfilCommun({ isLoading }) {
  // 🧠 Stores et hooks personnalisés (mémoïsés pour éviter les réévaluations inutiles)
  const user = useUserStore((state) => state.userData);
  const { logoutSafe, deleteAccount, getTokenSilentlyFromStore } = useMemo(() => ({
    logoutSafe: useUserStore.getState().logoutSafe,
    deleteAccount: useUserStore.getState().deleteAccount,
    getTokenSilentlyFromStore: useUserStore.getState().getTokenSilently,
  }), []);
  const { getTokenSilently, logout } = useAuth0();

  // 🧠 State local
  const [isEditing, setIsEditing] = useState(false); // Edition du profil
  const [isUpdating, setIsUpdating] = useState(false); // Chargement pour update
  const [notif, setNotif] = useState({ message: "", type: "success" }); // Notification
  const [onboardingSuccess, setOnboardingSuccess] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const onboardingSuccessParam = params.get("onboarding");

    if (onboardingSuccessParam === "success") {
      // Vérifie dans le store si le compte Stripe est réellement activé (details_submitted + charges_enabled)
      const vendeur = useUserStore.getState().userData?.infosVendeur;
      const isStripeOk = vendeur?.stripeDetailsSubmitted && vendeur?.stripeChargesEnabled;

      if (isStripeOk) {
        setOnboardingSuccess(true);
      }

      // Nettoie l'URL pour éviter la répétition
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);
  const [editableData, setEditableData] = useState({
    ...defaultEditableData,
    fullname: user?.fullname || "",
    phone: user?.phone || "",
    adresseComplete: (user?.infosClient?.adresseComplete || user?.infosVendeur?.adresseComplete) || "",
    typeDeTransport: user?.infosLivreur?.typeDeTransport || "",
    latitude: user?.infosClient?.latitude || user?.infosVendeur?.latitude || null,
    longitude: user?.infosClient?.longitude || user?.infosVendeur?.longitude || null,
  });
  const [adresseSuggestions, setAdresseSuggestions] = useState([]); // Suggestions d'adresse

  // 🧠 Références DOM
  const adresseInputRef = useRef(null);

  // 🧠 Sélection des infos utilisateur (mémoïsé)
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

  // 🧠 Constante dérivée pour savoir si l'adresse est requise
  const isAdresseRequired = role === "client" || role === "vendeur";

  // 🧮 Calcul du taux de complétion du profil (mémoïsé)
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

  // 🧮 Profil incomplet ? (mémoïsé)
  const profilIncomplet = useMemo(() => {
    if (role === "client") return !fullname || !phone || !infosClient?.adresseComplete;
    if (role === "vendeur") return !fullname || !phone || !infosVendeur?.adresseComplete;
    if (role === "livreur") return !fullname || !phone || !infosLivreur?.typeDeTransport;
    return false;
  }, [fullname, phone, role, infosClient, infosVendeur, infosLivreur]);

  // 🔄 Rafraîchir les données utilisateur (plus sécurisé, avec fallback)
  const refreshUserData = async () => {
    try {
      const { fetchUser, getTokenSilentlyFn } = useUserStore.getState();
      const fallback = getTokenSilently;
      const getTokenSilentlyToUse = getTokenSilentlyFn?.() || fallback;
      if (typeof getTokenSilentlyToUse !== "function") {
        throw new Error("getTokenSilently non défini ou invalide");
      }
      if (typeof fetchUser !== "function") {
        throw new Error("fetchUser non défini dans le store");
      }
      await fetchUser({ getTokenSilently: getTokenSilentlyToUse, silent: true });
    } catch (err) {
      console.error("❌ Erreur rechargement utilisateur :", err);
    }
  };

  // 📝 Gérer la modification des champs input
  const handleInputChange = (field, value) => {
    setEditableData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "adresseComplete"
        ? { latitude: null, longitude: null }
        : {}),
    }));
  };

  // ✅ Handler pour la mise à jour du profil (appel API)
  const handleUpdate = async (formData) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${VITE_API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      setNotif({ message: "Profil mis à jour avec succès !", type: "success" });
      await refreshUserData();
    } catch (err) {
      console.error("❌ Erreur fonction handleUpdate :", err);
      setNotif({ message: "❌ La mise à jour a échoué", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Handler pour basculer le mode édition
  const handleEditToggle = async () => {
    if (isEditing) {
      // Si l'adresse est requise et qu'elle a changé sans coordonnées, géocoder avant update
      if (
        isAdresseRequired &&
        editableData.adresseComplete &&
        (editableData.latitude === null || editableData.longitude === null)
      ) {
        try {
          const coords = await geocodeAdresse(editableData.adresseComplete);
          if (coords) {
            editableData.latitude = coords.latitude;
            editableData.longitude = coords.longitude;
          } else {
            setNotif({
              message: "❌ Adresse non trouvée. Veuillez saisir une adresse plus précise ou en choisir une dans les suggestions.",
              type: "error",
            });
            return;
          }
        } catch (err) {
          console.error("❌ Erreur fonction geocodeAdresse :", err);
          setNotif({
            message: "❌ Erreur de géocodage. Vérifiez votre connexion internet.",
            type: "error",
          });
          return;
        }
      }
      // Construction de l'objet utilisateur à mettre à jour
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
      // Préremplir les données éditables à partir du user
      setEditableData({
        ...defaultEditableData,
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

  // 🛑 Si pas d'utilisateur, afficher une erreur
  if (!user) return <p>Erreur : utilisateur introuvable</p>;

  // 📦 Données des sections
  const stripeAccountId = infosVendeur?.stripeAccountId;
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
                    onChange={(e) => handleInputChange("fullname", e.target.value)}
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
                      handleInputChange("phone", filteredValue);
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
                        handleInputChange("typeDeTransport", e.target.value)
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
                  isAdresseRequired && (
                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      <input
                        type="text"
                        value={editableData.adresseComplete}
                        onChange={async (e) => {
                          const value = e.target.value;
                          handleInputChange("adresseComplete", value);
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
                          setEditableData((prev) => ({
                            ...prev,
                            adresseComplete: label,
                            latitude: coords[1],
                            longitude: coords[0],
                          }));
                          setAdresseSuggestions([]);
                        }}
                        inputRef={adresseInputRef}
                      />
                    </div>
                  )
                )}
                {email && <UserFieldCard icon={<Mail size={18} />} value={email} />}
              </>
            ) : (
              <>
                {!profilIncomplet && <UserFieldCard icon={<User size={18} />} value={fullname} />}
                {email && <UserFieldCard icon={<Mail size={18} />} value={email} />}
                {!profilIncomplet && <UserFieldCard icon={<Phone size={18} />} value={phone} />}
                {isAdresseRequired && (
                  (role === "client" && infosClient?.adresseComplete) ||
                  (role === "vendeur" && infosVendeur?.adresseComplete)
                ) ? (
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
    ...(role === "vendeur"
      ? [{
          key: "paiement",
          title: "Paiement avec Stripe",
          content: (
            <div className="space-y-3">
              <StripePaiement
                stripeAccountId={stripeAccountId}
                redirectPath="/profil"
              />
            </div>
          ),
          cardClass: "bg-white shadow-sm border border-neutral-200 rounded-xl px-4 py-5",
        }]
      : []),
  ];

  // 🧩 Rendu
  return (
    <div className="relative z-10 pt-4">
      <AvatarHeader />
      {onboardingSuccess && (
        <NotificationBanner
          message="✅ Votre compte Stripe est désormais connecté !"
          type="success"
          onClose={() => setOnboardingSuccess(false)}
        />
      )}
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
                  const response = await fetch(`${VITE_API_URL}/account/password-reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user?.email }),
                  });
                  const result = await response.json();
                  if (!response.ok) throw new Error(result.error || "Erreur");
                  setNotif({ message: result.message || "Un email de réinitialisation a été envoyé à votre adresse.", type: "success" });
                } catch (err) {
                  console.error("❌ Erreur fonction handleResetPassword :", err);
                  setNotif({ message: "Erreur lors de l'envoi de l’email", type: "error" });
                }
              }}
              className="inline-flex items-center justify-start gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <span className="text-indigo-600">Modifier mon mot de passe</span>
            </button>

            <hr className="border-gray-200" />

            <Button
              onClick={() => logoutSafe(logout)}
              type="button"
              variant="primary"
            >
              Déconnexion
            </Button>

            <Button
              onClick={() => setShowConfirmDelete(true)}
              type="button"
              variant="secondary"
            >
              Supprimer mon profil
            </Button>
          </div>
        </InfoCard>
      </div>
      {/* Modal de confirmation suppression compte */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={deleteAccount}
        message="Cette action est irréversible. Toutes vos données seront supprimées définitivement."
      />
    </div>
  );
}