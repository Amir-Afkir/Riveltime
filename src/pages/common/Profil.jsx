// ✅ ProfilCommun.jsx
import { useState } from "react";
import AvatarHeader from "../../components/profile/AvatarHeader";
import { useUser } from "../../context/UserContext";
import InfoCard from "../../components/profile/InfoCard";
import IconRow from "../../components/profile/IconRow";
import ToggleSwitch from "../../components/profile/ToggleSwitch";
import Modal from "../../components/ui/Modal";
import UserForm from "../../components/logic/UserForm";
import MoyenPaiementForm from "../../components/profile/MoyenPaiementForm";
import { Lock } from "lucide-react";

export default function ProfilCommun() {
  const { userData: user, loadingUser: loading, refreshUser, logout, deleteAccount } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [paiementModalOpen, setPaiementModalOpen] = useState(false);

  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;


  const handleUpdate = async (formData) => {
    try {
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

      alert("Profil mis à jour !");
      if (typeof refreshUser === "function") refreshUser();
    } catch (err) {
      console.error("❌", err);
      alert("Échec de la mise à jour");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Erreur : utilisateur introuvable</p>;

  const { fullname, email, phone, role, avatarUrl, notifications, infosClient, infosVendeur, infosLivreur } = user;

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

  const getProfilCompletion = () => {
    let total = 3;
    let filled = 0;

    if (fullname) filled++;
    if (phone) filled++;
    if (role === "client" && infosClient?.adresseComplete) filled++;
    if (role === "vendeur" && infosVendeur?.categorie && infosVendeur?.adresseComplete) filled += 2;
    if (role === "livreur" && infosLivreur?.typeDeTransport) filled++;

    const max = role === "vendeur" ? 4 : 3;
    return Math.round((filled / max) * 100);
  };

  const profilCompletion = getProfilCompletion();

  const roleColor = {
    client: "text-blue-600 hover:text-blue-700",
    vendeur: "text-green-600 hover:text-green-700",
    livreur: "text-orange-600 hover:text-orange-700"
  }[role] || "text-gray-600 hover:text-gray-700";

  const sections = [
    {
      key: "infos",
      title: "Mes informations",
      content: (
        <>
          {isProfilIncomplet() && (
            <p className="bg-yellow-50 text-yellow-900 p-2 text-sm rounded border border-yellow-300 font-medium">
              ⚠️ Votre profil est incomplet. Veuillez le compléter.
            </p>
          )}
          {!isProfilIncomplet() && (
            <>
              <IconRow label="Nom" value={fullname} />
              {email && <IconRow label="Email" value={email} />}
              <IconRow label="Téléphone" value={phone} />
              {(role === "client" && infosClient?.adresseComplete) ||
              (role === "vendeur" && infosVendeur?.adresseComplete) ? (
                <IconRow label="Adresse" value={infosClient?.adresseComplete || infosVendeur?.adresseComplete} />
              ) : null}
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
          className={`inline-flex items-center text-sm font-medium transition-colors duration-200 ${
            isProfilIncomplet()
              ? "text-yellow-600 hover:text-yellow-700"
              : roleColor
          }`}
        >
          {isProfilIncomplet() ? "Compléter" : "Modifier"}
        </button>
      ),
      cardClass: `bg-gray-50 shadow-md${isProfilIncomplet() ? " border-l-4 border-yellow-400 bg-yellow-50" : ""}`,
    },
    {
      key: "notifications",
      title: "Notifications",
      content: <ToggleSwitch label="Recevoir les alertes e-mail" checked={notifications ?? false} role={role} />,
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
  ];

  return (
      <div className="relative z-10 pt-4">
        <AvatarHeader />
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
                (section.cardClass ||
                  "bg-white shadow-lg rounded-2xl border border-gray-100") +
                " transition-all duration-500"
              }
            >
              {section.content}
            </InfoCard>
          );
        })}

        <InfoCard
          title="Sécurité"
          className="bg-white shadow-lg rounded-2xl border border-gray-100 transition-all duration-500"
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

                  alert(result.message || "Un email de réinitialisation a été envoyé à votre adresse.");
                } catch (err) {
                  console.error("❌", err);
                  alert("Erreur lors de l'envoi de l’email");
                }
              }}
              className="inline-flex items-center justify-start gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <Lock className="w-4 h-4 text-indigo-600" strokeWidth={2} />
              <span>Modifier mon mot de passe</span>
            </button>

            <hr className="border-gray-200" />

            <button
              onClick={() => {
                logout({ returnTo: import.meta.env.VITE_BASE_URL });
              }}
              className="w-full bg-neutral-50 !text-black border border-gray-300 hover:bg-neutral-100 active:scale-[0.98] active:shadow-inner focus-visible:ring-2 focus-visible:ring-red-300 rounded-full flex items-center justify-center gap-2 py-2.5 text-[15px] transition-all"
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
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Modifier mes informations">
          <UserForm
            role={role}
            initialData={user}
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
                ...user,
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