import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function Profil() {
  return (
    <div className="min-h-screen bg-green-50 pb-24">
      <Header title="Mon Profil" showBack={false} color="green" />
      <div className="p-4 max-w-md mx-auto space-y-4 text-gray-700">

        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-lg mb-2">Informations</h2>
          <p><strong>Boutique :</strong> La Papeterie Locale</p>
          <p><strong>Catégorie :</strong> Fournitures</p>
          <p><strong>Email :</strong> contact@papeterie-locale.fr</p>
          <p><strong>Téléphone :</strong> 06 12 34 56 78</p>
          <p><strong>Adresse :</strong> 123 rue de l'Artisanat, Orléans</p>
          <p><strong>Horaires :</strong> Lun-Sam : 9h - 19h</p>
        </section>

        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Modifier mes informations
        </button>

        <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">
          Se déconnecter
        </button>

      </div>
      <BottomNav role="vendeur" />
    </div>
  );
}