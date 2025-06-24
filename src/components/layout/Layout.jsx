// src/components/layout/Layout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Header from "./Header";   
import BottomNav from "./BottomNav"; 

export default function Layout() {
  const location = useLocation();

  const getColor = (path) =>
    path.startsWith('/vendeur') ? 'green' :
    path.startsWith('/livreur') ? 'orange' : 'blue';

  const color = getColor(location.pathname);

  const bgColor = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
  }[color] || 'bg-gray-50';

  // Fonction pour obtenir un titre plus robuste selon le chemin d'URL
  const getTitle = (path) => {
    const rules = [
      ['/client/accueil', 'Accueil'],
      ['/client/panier', 'Mon panier'],
      ['/client/commandes', 'Commandes'],
      ['/client/profil', 'Mon profil'],
      ['/client/messages', 'Messages'],
      ['/vitrine/', 'Vitrine'],
      ['/vendeur/dashboard', 'Tableau de bord'],
      ['/vendeur/produits', 'Mes produits'],
      ['/vendeur/commandes', 'Commandes'],
      ['/vendeur/profil', 'Mon profil'],
      ['/vendeur/messages', 'Messages'],
      ['/livreur/dashboard', 'Tableau de bord'],
      ['/livreur/courses', 'Courses'],
      ['/livreur/historique', 'Historique'],
      ['/livreur/profil', 'Mon profil'],
      ['/livreur/messages', 'Messages'],
    ];
    for (const [prefix, label] of rules) {
      if (path.startsWith(prefix)) return label;
    }
    return path === '/' ? 'Accueil' : 'Riveltime';
  };

  const path = location.pathname;
  const title = getTitle(path);

  return (
    <div className={`min-h-screen pb-28 ${bgColor}`}>
      <Header title={title} showBack={false} color={color} />
      <main className="p-4 max-w-md mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}