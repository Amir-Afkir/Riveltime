import Header from "../../components/layout/Header";
import BottomNav from "../../components/layout/BottomNav";
import UserProfileSections from "../../components/logic/UserProfileSections";

export default function ProfilClient() {
  const user = {
    client: {
      nom: "Jean Dupont",
      email: "jean.dupont@example.com",
      telephone: "06 12 34 56 78",
    },
    notifications: true,
  };

  return (
    <div className="min-h-screen bg-blue-50 pb-28">
      <Header title="Mon profil" showBack={false} />
      <div className="max-w-md mx-auto p-4 space-y-6 text-gray-700">
        <UserProfileSections user={user} role="client" />
      </div>
      <BottomNav />
    </div>
  );
}
  