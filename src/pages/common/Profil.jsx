// ✅ src/pages/common/Profil.jsx
import { useState } from "react";
import { useUser } from "../../context/UserContext";
import AvatarHeader from "../../components/profile/AvatarHeader";
import InfoCard from "../../components/profile/InfoCard";
import IconRow from "../../components/profile/IconRow";
import ToggleSwitch from "../../components/profile/ToggleSwitch";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import UserForm from "../../components/logic/UserForm";
import { useAuth0 } from "@auth0/auth0-react";
import MoyenPaiementForm from "../../components/profile/MoyenPaiementForm";

export default function ProfilCommun() {
  const { userData, loadingUser } = useUser();
  const { logout, user: auth0User, getAccessTokenSilently } = useAuth0();
  const [modalOpen, setModalOpen] = useState(false);
  const [paiementModalOpen, setPaiementModalOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Cette action est irréversible. Supprimer votre compte ?")) return;

    if (!auth0User) {
      alert("Utilisateur non connecté");
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          scope: 'openid profile email',
        },
      });

      const response = await fetch("/api/account/delete/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur serveur");
      }

      logout({ returnTo: window.location.origin });
    } catch (err) {
      console.error("❌ Erreur lors de la suppression :", err);
      alert("La suppression du compte a échoué.");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { scope: "openid profile email" },
      });

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      alert("Profil mis à jour !");
      window.location.reload(); // Pour recharger les infos
    } catch (err) {
      console.error("❌", err);
      alert("Échec de la mise à jour");
    }
  };

  if (loadingUser) return <p>Chargement...</p>;
  if (!userData) return <p>Erreur : utilisateur introuvable</p>;

  const { fullname, email, phone, role, avatarUrl, notifications, infosClient, infosVendeur, infosLivreur } = userData;

  // Fonction pour vérifier si le profil est incomplet
  const isProfilIncomplet = () => {
    if (role === "client") {
      return !fullname || !email || !phone || !infosClient?.adresseComplete;
    }
    if (role === "vendeur") {
      return !fullname || !phone || !infosVendeur?.categorie || !infosVendeur?.adresseComplete;
    }
    if (role === "livreur") {
      return !fullname || !email || !phone || !infosLivreur?.siret || !infosLivreur?.zone;
    }
    return false;
  };

  return (
    <>
      <div className="space-y-6">
        <InfoCard
          title="Mes informations"
          className={isProfilIncomplet() ? "bg-yellow-50 border-l-4 border-yellow-400" : ""}
          action={
            <button
              onClick={() => setModalOpen(true)}
              className={`inline-flex items-center text-sm font-medium ${
                isProfilIncomplet()
                  ? "text-yellow-600 hover:text-yellow-700"
                  : role === "client"
                    ? "text-blue-600 hover:text-blue-700"
                    : role === "vendeur"
                      ? "text-green-600 hover:text-green-700"
                      : role === "livreur"
                        ? "text-orange-600 hover:text-orange-700"
                        : "text-gray-600 hover:text-gray-700"
              }`}
            >
              {isProfilIncomplet() ? "Compléter" : "Modifier"}
            </button>
          }
        >
          {isProfilIncomplet() && (
            <p className="text-yellow-800 mb-2">Votre profil est incomplet. Veuillez le compléter.</p>
          )}

          {!isProfilIncomplet() && (
            <>
              <IconRow label="Nom" value={fullname} />
              {email && <IconRow label="Email" value={email} />}
              <IconRow label="Téléphone" value={phone} />
              {role === "client" && infosClient?.adresseComplete && (
                <IconRow label="Adresse" value={infosClient.adresseComplete} />
              )}
              {role === "vendeur" && infosVendeur?.adresseComplete && (
                <IconRow label="Adresse" value={infosVendeur.adresseComplete} />
              )}
              {role === "livreur" && infosLivreur?.zone && (
                <IconRow label="Zone" value={infosLivreur.zone} />
              )}
            </>
          )}
        </InfoCard>

        <InfoCard
            title="Notifications"
            action={<ToggleSwitch checked={notifications ?? false} />}>
            Email Alerts
        </InfoCard>

        {!isProfilIncomplet() && role === "vendeur" && (
          <InfoCard
            title="Moyens de paiement"
            action={
              <button
                onClick={() => setPaiementModalOpen(true)}
                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
              >
                Modifier
              </button>
            }
          >
            {infosVendeur?.moyensPaiement?.length > 0 ? (
              <p>{infosVendeur.moyensPaiement.join(", ")}</p>
            ) : (
              <p className="text-gray-500 italic">Aucun moyen de paiement renseigné</p>
            )}
          </InfoCard>
        )}

        <InfoCard title="Sécurité">
          <div className="flex justify-between items-center w-full">
            <button
              className="text-sm text-red-600 hover:underline"
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              Se déconnecter
            </button>
            <button
              className="text-sm text-red-600 hover:underline"
              onClick={handleDeleteAccount}
            >
              Supprimer mon compte
            </button>
          </div>
        </InfoCard>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Modifier mes informations">
        <UserForm
          role={role}
          initialData={userData}
          onSubmit={async (formData) => {
            await handleUpdate(formData);
            setModalOpen(false);
          }}
        />
      </Modal>

      <Modal open={paiementModalOpen} onClose={() => setPaiementModalOpen(false)} title="Modifier les moyens de paiement">
        <MoyenPaiementForm
          moyensPaiement={infosVendeur?.moyensPaiement || []}
          onSubmit={async (updatedPaiements) => {
            await handleUpdate({
              ...userData,
              infosVendeur: {
                ...infosVendeur,
                moyensPaiement: updatedPaiements,
              },
            });
            setPaiementModalOpen(false);
          }}
        />
      </Modal>
    </>
  );
}