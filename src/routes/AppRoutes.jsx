// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/common/Home.jsx';
import Layout from '../components/layout/Layout.jsx';
import ProfilCommun from '../pages/common/Profil.jsx';

// Client
import ClientAccueil from '../pages/client/Accueil.jsx';
import Vitrine from '../pages/client/Vitrine.jsx';
import Panier from '../pages/client/Panier.jsx';
import CommandesClient from '../pages/client/Commandes.jsx';
import MessagesClient from '../pages/client/Messages.jsx';

// Vendeur
import DashboardVendeur from '../pages/vendeur/Dashboard.jsx';
import Produits from '../pages/vendeur/Produits.jsx';
import CommandesVendeur from '../pages/vendeur/Commandes.jsx';
import MessagesVendeur from '../pages/vendeur/Messages.jsx';

// Livreur
import DashboardLivreur from '../pages/livreur/Dashboard.jsx';
import Courses from '../pages/livreur/Courses.jsx';
import Historique from '../pages/livreur/Historique.jsx';
import MessagesLivreur from '../pages/livreur/Messages.jsx';

const clientRoutes = [
  { path: "/client/accueil", element: <ClientAccueil /> },
  { path: "/vitrine/:id", element: <Vitrine /> },
  { path: "/client/panier", element: <Panier /> },
  { path: "/client/commandes", element: <CommandesClient /> },
  { path: "/client/profil", element: <ProfilCommun /> },
  { path: "/client/messages", element: <MessagesClient /> },
];

const vendeurRoutes = [
  { path: "/vendeur/dashboard", element: <DashboardVendeur /> },
  { path: "/vendeur/produits", element: <Produits /> },
  { path: "/vendeur/commandes", element: <CommandesVendeur /> },
  { path: "/vendeur/profil", element: <ProfilCommun /> },
  { path: "/vendeur/messages", element: <MessagesVendeur /> },
];

const livreurRoutes = [
  { path: "/livreur/dashboard", element: <DashboardLivreur /> },
  { path: "/livreur/courses", element: <Courses /> },
  { path: "/livreur/historique", element: <Historique /> },
  { path: "/livreur/profil", element: <ProfilCommun /> },
  { path: "/livreur/messages", element: <MessagesLivreur /> },
];

export default function AppRoutes() {
  return (
    <Routes>
      {/* Page d'accueil publique (hors layout) */}
      <Route path="/" element={<Home />} />

      {/* Layout commun à toutes les routes utilisateur */}
      <Route element={<Layout />}>
        {[...clientRoutes, ...vendeurRoutes, ...livreurRoutes].map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>
    </Routes>
  );
}