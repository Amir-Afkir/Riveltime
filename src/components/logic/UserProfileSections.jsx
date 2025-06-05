import Section from "../ui/Section";
import Title from "../ui/Title";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function UserProfileSections({ user, role }) {
  const navigate = useNavigate();
  const { logout, user: auth0User, getAccessTokenSilently } = useAuth0();

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Cette action est irréversible. Supprimer votre compte ?")) return;

    if (!auth0User) {
      alert("Utilisateur non connecté");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const userId = auth0User?.sub;

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

  return (
    <>
      {/* Infos client */}
      {role === "client" && user.client && (
        <Section>
          <Title level={2}>Mes informations</Title>
          <p><strong>Nom :</strong> {user.client.nom}</p>
          <p><strong>Email :</strong> {user.client.email}</p>
          <p><strong>Téléphone :</strong> {user.client.telephone}</p>
          <Button className="w-full" onClick={() => navigate("/client/profil")}>
            Modifier mes informations
          </Button>
        </Section>
      )}

      {/* Infos vendeur */}
      {role === "vendeur" && user.boutique && (
        <Section>
          <Title level={2}>Informations de la boutique</Title>
          <p><strong>Nom :</strong> {user.boutique.nom}</p>
          <p><strong>Catégorie :</strong> {user.boutique.categorie}</p>
          <p><strong>Siret :</strong> {user.boutique.siret}</p>
          <p><strong>Email :</strong> {user.boutique.email}</p>
          <p><strong>Téléphone :</strong> {user.boutique.telephone}</p>
          <p><strong>Adresse :</strong> {user.boutique.adresse}</p>
          <p><strong>Horaires :</strong> {user.boutique.horaires}</p>
          <Button className="w-full" onClick={() => navigate("/vendeur/boutique")}>
            Modifier mes informations
          </Button>
        </Section>
      )}

      {/* Infos livreur */}
      {role === "livreur" && user.zone && (
        <Section>
          <Title level={2}>Société de livraison</Title>
          <p><strong>Nom :</strong> {user.nom}</p>
          <p><strong>Email :</strong> {user.email}</p>
          <p><strong>Téléphone :</strong> {user.telephone}</p>
          <p><strong>Siret :</strong> {user.siret}</p>
          <p><strong>Zone :</strong> {user.zone}</p>
          <Button className="w-full" onClick={() => navigate("/livreur/profil")}>
            Modifier mes informations
          </Button>
        </Section>
      )}

      <Section>
        <Title level={2}>Préférences</Title>
        <label className="flex items-center justify-between">
          <span>Notifications</span>
          <input type="checkbox" checked={user.notifications} readOnly />
        </label>
      </Section>

      <Section>
        <Title level={2}>Paramètres</Title>
        <div className="space-y-2">
          <Button variant="link" className="w-full text-left">
            Changer de mot de passe
          </Button>
          <Button
            variant="link"
            className="w-full text-left text-red-600"
            onClick={() => logout({ returnTo: window.location.origin })}
          >
            Se déconnecter
          </Button>
          <Button
            variant="link"
            className="w-full text-left text-red-600"
            onClick={handleDeleteAccount}
          >
            Supprimer mon compte
          </Button>
        </div>
      </Section>
    </>
  );
}