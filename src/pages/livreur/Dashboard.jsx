// src/pages/livreur/Dashboard.jsx
import Section from "../../components/ui/Section";
import Title from "../../components/ui/Title";
import Button from "../../components/ui/Button";

export default function DashboardLivreur() {
  return (
    <div className="space-y-6 text-gray-700">

      {/* Bloc Statut Global */}
      <Section>
        <div className="flex items-center justify-between">
          <Title level={2}>Statut</Title>
          <span className="text-sm text-green-600 font-medium">✅ Disponible</span>
        </div>
        <p className="text-sm mt-1">📦 3 courses en attente · ✅ 4 livrées aujourd’hui</p>
      </Section>

      {/* Bloc suivi de la course en cours */}
      <Section>
        <Title level={2}>Course en cours</Title>
        <p className="mb-2">🛍️ Jean Dupont – Rue du Faubourg</p>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li className="text-orange-600 font-semibold">1. En attente – Commande acceptée</li>
          <li>2. En cours – Vers le magasin</li>
          <li>3. Presque – Vers le client</li>
          <li>4. Livrée</li>
        </ol>
        <Button variant="orange" className="mt-3 w-full">
          Passer à l'étape suivante
        </Button>
      </Section>

      {/* Bloc Courses disponibles */}
      <Section>
        <Title level={2}>Courses à accepter</Title>
        <ul className="text-sm space-y-2">
          <li className="border p-2 rounded flex justify-between items-center">
            <span>📦 La Papeterie Locale → Rue Jeanne d’Arc</span>
            <Button variant="orange" className="px-3 py-1 text-sm">Accepter</Button>
          </li>
          {/* autres courses */}
        </ul>
      </Section>

      {/* Bloc Statistiques */}
      <Section>
        <Title level={2}>Statistiques</Title>
        <p>Livraisons totales : <span className="font-medium">48</span></p>
        <p>Évaluations moyennes : <span className="font-medium">4.7 ⭐</span></p>
        <p>Temps moyen de livraison : <span className="font-medium">23 min</span></p>
        <Button className="mt-2 text-blue-600 text-sm hover:underline" variant="orange">
          Voir l’historique
        </Button>
      </Section>

    </div>
  );
}