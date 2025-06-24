import { useState } from "react";
import Section from "../ui/Section";
import Title from "../ui/Title";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import UserForm from "../logic/UserForm";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function UserProfileSections({ user: passedUser }) {
  const [modalOpen, setModalOpen] = useState(false);
  const user = passedUser;
  const navigate = useNavigate();
  const { logout, user: auth0User, getAccessTokenSilently } = useAuth0();

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

      const response = await fetch("/api/auth/delete/me", {
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

  if (!user || Object.keys(user).length === 0) {
    console.warn("⚠️ Aucune donnée utilisateur reçue ou objet vide.");
    return <p>Chargement du profil...</p>;
  }

  const role = user.role;

  return (
    <>
      {/* Infos client */}
      {role === "client" && (
        <Section>
          <Title level={2}>Mes informations</Title>
          <p><strong>Nom :</strong> {user.fullname}</p>
          <p><strong>Email :</strong> {user.email}</p>
          <p><strong>Téléphone :</strong> {user.phone}</p>
          <Button className="w-full" onClick={() => setModalOpen(true)}>Modifier mes informations</Button>
        </Section>
      )}

      {/* Infos vendeur */}
      {role === "vendeur" && (
  <>
    {/* Si infosVendeur est vide ou sans valeur exploitable */}
    {(!user.infosVendeur || Object.values(user.infosVendeur).every(
      v => v === null || v === "" || (Array.isArray(v) && v.length === 0)
    ) || !user.infosVendeur.adresseComplete) ? (
      <Section>
        <Title level={2}>Profil incomplet</Title>
        <p className="text-sm text-gray-600">
          Vous n’avez pas encore renseigné les informations de votre boutique. Cela est nécessaire pour être visible sur la plateforme.
        </p>
        <Button className="bg-green-600 text-white w-full mt-4" onClick={() => setModalOpen(true)}>
          Compléter mon profil
        </Button>
      </Section>
    ) : (
      <Section>
        <Title level={2}>Informations de la boutique</Title>

        <p><strong>Nom :</strong> {user.fullname}</p>
        <p><strong>Téléphone :</strong> {user.phone}</p>
        <p><strong>Catégorie :</strong> {user.infosVendeur.categorie}</p>
        <p><strong>Adresse :</strong> {user.infosVendeur.adresseComplete}</p>
        <p><strong>Moyens de paiement :</strong> {user.infosVendeur.moyensPaiement?.join(', ') || "Non spécifiés"}</p>

        <Button className="bg-green-600 text-white w-full mt-4" onClick={() => setModalOpen(true)}>
          Modifier mes informations
        </Button>
      </Section>
    )}
  </>
)}

      {/* Infos livreur */}
      {role === "livreur" && user.infosLivreur && (
        <Section>
          <Title level={2}>Société de livraison</Title>
          <p><strong>Nom :</strong> {user.fullname}</p>
          <p><strong>Email :</strong> {user.email}</p>
          <p><strong>Téléphone :</strong> {user.phone}</p>
          <p><strong>Siret :</strong> {user.infosLivreur.siret}</p>
          <p><strong>Zone :</strong> {user.infosLivreur.zone}</p>
          <Button className="w-full" onClick={() => setModalOpen(true)}>Modifier mes informations</Button>
        </Section>
      )}

      <Section>
        <Title level={2}>Préférences</Title>
        <label className="flex items-center justify-between">
          <span>Notifications</span>
          <input type="checkbox" checked={user.notifications ?? false} readOnly />
        </label>
      </Section>

      <Section>
        <Title level={2}>Paramètres</Title>
        <div className="space-y-2">
          <Button variant="link" className="w-full text-left">Changer de mot de passe</Button>
          <Button variant="link" className="w-full text-left text-red-600" onClick={() => logout({ returnTo: window.location.origin })}>Se déconnecter</Button>
          <Button variant="link" className="w-full text-left text-red-600" onClick={handleDeleteAccount}>Supprimer mon compte</Button>
        </div>
      </Section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Modifier mes informations">
        <UserForm
          role={user.role}
          initialData={user}
          onSubmit={async (formData) => {
            try {
              const token = await getAccessTokenSilently({
                authorizationParams: {
                  scope: 'openid profile email',
                },
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
              setModalOpen(false);
              window.location.reload();
            } catch (err) {
              console.error("❌", err);
              alert("Échec de la mise à jour");
            }
          }}
        />
      </Modal>
    </>
  );
}