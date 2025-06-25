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

export default function ProfilCommun() {
  const { userData, loadingUser } = useUser();
  const { logout, user: auth0User, getAccessTokenSilently } = useAuth0();
  const [modalOpen, setModalOpen] = useState(false);

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
    <div className="space-y-6">
      {isProfilIncomplet() && (
        <InfoCard title="🔔 Profil incomplet" className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
          <p>Veuillez compléter votre profil pour bénéficier de toutes les fonctionnalités.</p>
          <Button className="mt-2" onClick={() => setModalOpen(true)}>
            Compléter mes informations
          </Button>
        </InfoCard>
      )}

      {!isProfilIncomplet() && role === "client" && (
        <InfoCard title="Mes informations">
          <IconRow label="Nom" value={fullname} />
          <IconRow label="Email" value={email} />
          <IconRow label="Téléphone" value={phone} />
          <Button className="mt-4" onClick={() => setModalOpen(true)}>Modifier mes informations</Button>
        </InfoCard>
      )}

      {!isProfilIncomplet() && role === "vendeur" && infosVendeur && (
        <InfoCard title="Boutique">
          <IconRow label="Nom" value={fullname} />
          <IconRow label="Téléphone" value={phone} />
          <IconRow label="Catégorie" value={infosVendeur.categorie} />
          <IconRow label="Adresse" value={infosVendeur.adresseComplete} />
          <IconRow label="Paiements" value={infosVendeur.moyensPaiement?.join(", ") || "Non spécifiés"} />
          <Button className="mt-4" onClick={() => setModalOpen(true)}>Modifier mes informations</Button>
        </InfoCard>
      )}

      {!isProfilIncomplet() && role === "livreur" && infosLivreur && (
        <InfoCard title="Société de livraison">
          <IconRow label="Nom" value={fullname} />
          <IconRow label="Email" value={email} />
          <IconRow label="Téléphone" value={phone} />
          <IconRow label="SIRET" value={infosLivreur.siret} />
          <IconRow label="Zone" value={infosLivreur.zone} />
          <Button className="mt-4" onClick={() => setModalOpen(true)}>Modifier mes informations</Button>
        </InfoCard>
      )}

      <InfoCard title="Préférences">
        <ToggleSwitch label="Notifications" checked={notifications ?? false} />
      </InfoCard>

      <InfoCard title="Sécurité">
        <div className="space-y-2">
          <Button variant="link" className="text-red-600" onClick={() => logout({ returnTo: window.location.origin })}>
            Se déconnecter
          </Button>
          <Button variant="link" className="text-red-600" onClick={handleDeleteAccount}>
            Supprimer mon compte
          </Button>
        </div>
      </InfoCard>

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
    </div>
  );
}