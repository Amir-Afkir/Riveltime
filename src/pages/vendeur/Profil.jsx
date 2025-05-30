import Header from "../../components/layout/Header";
import BottomNav from "../../components/layout/BottomNav";
import UserProfileSections from "../../components/logic/UserProfileSections";

export default function ProfilVendeur() {
  const user = {
    nom: "Michel S",
    email: "contact@papeterie-locale.fr",
    telephone: "06 12 34 56 78",
    notifications: true,
    boutique: {
      nom: "La Papeterie Locale",
      categorie: "Fournitures",
      siret: "123 456 789 00013",
      email: "contact@papeterie-locale.fr",
      telephone: "06 12 34 56 78",
      adresse: "123 rue de l'Artisanat, Orléans",
      horaires: "Lun-Sam : 9h - 19h",
    },
  };
    
  return (
    <div className="min-h-screen bg-green-50 pb-28">
      <Header title="Mon profil" showBack={false} color="green" />
      <div className="max-w-md mx-auto p-4 space-y-6 text-gray-700">
        <UserProfileSections user={user} role="vendeur" />
      </div>
      <BottomNav />
    </div>
  );
}