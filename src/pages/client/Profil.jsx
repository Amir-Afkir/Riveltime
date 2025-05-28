import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function ProfilClient() {
  return (
    <div className="min-h-screen bg-blue-50 pb-20">
      <Header title="Mon profil" showBack={false} />
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Mon Profil</h1>

        {/* Section Informations Personnelles */}
        <section className="mb-6 bg-white rounded p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Informations personnelles</h2>
          <p><strong>Nom :</strong> Jean Dupont</p>
          <p><strong>Email :</strong> jean.dupont@example.com</p>
          <p><strong>Téléphone :</strong> 06 12 34 56 78</p>
          <button className="mt-3 text-sm text-blue-600 hover:underline">Modifier</button>
        </section>

        {/* Section Sécurité */}
        <section className="mb-6 bg-white rounded p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Sécurité</h2>
          <button className="text-sm text-blue-600 hover:underline">Changer de mot de passe</button>
        </section>

        {/* Section Préférences */}
        <section className="bg-white rounded p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Préférences</h2>
          <div className="flex items-center justify-between">
            <span>Notifications</span>
            <input type="checkbox" checked readOnly />
          </div>
          <button className="mt-4 w-full text-red-600 text-sm hover:underline">Supprimer mon compte</button>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}