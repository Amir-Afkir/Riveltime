// ✅ ProfilCommun.jsx
import { useState } from "react";
import { useUser } from "../../context/UserContext";
import InfoCard from "../../components/profile/InfoCard";
import IconRow from "../../components/profile/IconRow";
import ToggleSwitch from "../../components/profile/ToggleSwitch";
import Modal from "../../components/ui/Modal";
import UserForm from "../../components/logic/UserForm";
import { useAuth0 } from "@auth0/auth0-react";
import MoyenPaiementForm from "../../components/profile/MoyenPaiementForm";

export default function ProfilCommun() {
  const { userData, loadingUser } = useUser();
  const { logout, user: auth0User, getAccessTokenSilently } = useAuth0();
  const [modalOpen, setModalOpen] = useState(false);
  const [paiementModalOpen, setPaiementModalOpen] = useState(false);

  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const resetPasswordUrl = `https://${auth0Domain}/lo/reset?client_id=${clientId}`;

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Cette action est irréversible. Supprimer votre compte ?")) return;

    if (!auth0User) return alert("Utilisateur non connecté");

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { scope: "openid profile email" },
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/account/delete/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erreur serveur");

      logout({ returnTo: import.meta.env.VITE_BASE_URL});
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

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      alert("Profil mis à jour !");
      window.location.reload();
    } catch (err) {
      console.error("❌", err);
      alert("Échec de la mise à jour");
    }
  };

  if (loadingUser) return <p>Chargement...</p>;
  if (!userData) return <p>Erreur : utilisateur introuvable</p>;

  const { fullname, email, phone, role, avatarUrl, notifications, infosClient, infosVendeur, infosLivreur } = userData;

  const isProfilIncomplet = () => {
    if (role === "client") {
      return !fullname || !phone || !infosClient?.adresseComplete;
    }
    if (role === "vendeur") {
      return !fullname || !phone || !infosVendeur?.categorie || !infosVendeur?.adresseComplete;
    }
    if (role === "livreur") {
      return !fullname || !phone || !infosLivreur?.typeDeTransport;
    }
    return false;
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="space-y-4 px-4">
        {[
          {
            key: "infos",
            title: "Mes informations",
            content: (
              <>
                {isProfilIncomplet() && (
                  <p className="text-yellow-800 mb-2 text-sm">Votre profil est incomplet. Veuillez le compléter.</p>
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
                    {role === "livreur" && infosLivreur?.typeDeTransport && (
                      <IconRow label="Transport" value={infosLivreur.typeDeTransport} />
                    )}
                  </>
                )}
              </>
            ),
            action: (
              <button
                onClick={() => setModalOpen(true)}
                className={`inline-flex items-center text-sm font-medium transition-colors duration-200
                  ${isProfilIncomplet()
                    ? "text-yellow-600 hover:text-yellow-700"
                    : role === "client"
                    ? "text-blue-600 hover:text-blue-700"
                    : role === "vendeur"
                    ? "text-green-600 hover:text-green-700"
                    : role === "livreur"
                    ? "text-orange-600 hover:text-orange-700"
                    : "text-gray-600 hover:text-gray-700"}`}
              >
                {isProfilIncomplet() ? "Compléter" : "Modifier"}
              </button>
            ),
            cardClass: `bg-gray-50 shadow-md${isProfilIncomplet() ? " border-l-4 border-yellow-400 bg-yellow-50" : ""}`,
          },
          {
            key: "notifications",
            title: "Notifications",
            content: <ToggleSwitch label="Email Alerts" checked={notifications ?? false} role={role} />,
          },
          ...(role === "vendeur" && !isProfilIncomplet()
            ? [
                {
                  key: "paiement",
                  title: "Moyens de paiement",
                  content: infosVendeur?.moyensPaiement?.length > 0 ? (
                    <p>{infosVendeur.moyensPaiement.join(", ")}</p>
                  ) : (
                    <p className="text-gray-500 italic">Aucun moyen de paiement renseigné</p>
                  ),
                  action: (
                    <button
                      onClick={() => setPaiementModalOpen(true)}
                      className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
                    >
                      Modifier
                    </button>
                  ),
                },
              ]
            : []),
        ].map((section, index) => {
          // Nouveau style d'animation plus fluide et aspect iOS moderne
          const baseDelay = 80;
          const stagger = 100;
          const delay = baseDelay + index * stagger;
          // Ajout du style pour l'animation
          const animationStyle = {
            animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            animationDuration: '480ms',
          };
          return (
            <InfoCard
              key={section.key}
              title={section.title}
              action={section.action}
              delay={delay}
              className={
                // Ajout d'un effet visuel évoquant iOS (arrondi, ombre douce, fond blanc, légère bordure)
                (section.cardClass ||
                  "bg-white shadow-lg rounded-2xl border border-gray-100") +
                " transition-all duration-500"
              }
              style={animationStyle}
            >
              {section.content}
            </InfoCard>
          );
        })}

        <InfoCard
          title="Sécurité"
          className="bg-white shadow-lg rounded-2xl border border-gray-100 transition-all duration-500"
          delay={80 + 4 * 100}
          style={{
            animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            animationDuration: '480ms',
          }}
        >
          <div className="flex flex-col space-y-4 pt-1">
          <button
            onClick={async () => {
              try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/account/password-reset`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: auth0User?.email }),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "Erreur");

                alert(result.message || "Un email de réinitialisation a été envoyé à votre adresse.");
              } catch (err) {
                console.error("❌", err);
                alert("Erreur lors de l'envoi de l’email");
              }
            }}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            🔒 <span className="ml-1">Modifier mon mot de passe</span>
          </button>

            <hr className="border-gray-200" />

            <div className="flex justify-between">
              <button
                className="text-sm text-gray-700 hover:text-gray-900"
                onClick={() => {
                  console.log("🔁 redirect to:", import.meta.env.VITE_BASE_URL);
                  logout({returnTo: import.meta.env.VITE_BASE_URL});
                }}
              >
                Se déconnecter
              </button>
              <button
                className="text-sm text-red-700 font-semibold hover:underline"
                onClick={handleDeleteAccount}
              >
                Supprimer mon compte
              </button>
            </div>
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
    </div>
  );
}