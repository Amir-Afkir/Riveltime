// ✅ Profil du livreur
import Header from "../../components/layout/Header";
import BottomNav from "../../components/layout/BottomNav";
import UserProfileSections from "../../components/logic/UserProfileSections";

export default function ProfilLivreur() {
  const user = {
    nom: "Amir L",
    email: "amir@example.com",
    telephone: "06 12 34 56 78",
    siret: "123 456 789 00013",
    zone: "Orléans",
    notifications: true,
  };

  return (
    <div className="min-h-screen bg-orange-50 pb-28">
      <Header title="Mon profil" showBack={false} color="orange" />
      <div className="max-w-md mx-auto p-4 space-y-6 text-gray-700">
        <UserProfileSections user={user} role="livreur" />
      </div>
      <BottomNav />
    </div>
  );
}