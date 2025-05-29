import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import UserProfileSections from "../../components/ui/UserProfileSections";

export default function ProfilClient() {
  const user = {
    nom: "Jean Dupont",
    email: "jean.dupont@example.com",
    telephone: "06 12 34 56 78",
    notifications: true,
  };

  return (
    <div className="min-h-screen bg-blue-50 pb-28">
      <Header title="Mon profil" showBack={false} />
      <div className="max-w-md mx-auto p-4 space-y-6 text-gray-700">
        <UserProfileSections user={user} />
      </div>
      <BottomNav />
    </div>
  );
}