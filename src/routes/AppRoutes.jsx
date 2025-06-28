// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/common/Home.jsx';
import Layout from '../components/layout/Layout.jsx';
import ProfilCommun from '../pages/common/Profil.jsx';
import AccessGuard from "../components/logic/AccessGuard.jsx";

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
  { path: "/client/accueil", element: <AccessGuard allowedRoles={["client"]}><ClientAccueil /></AccessGuard> },
  { path: "/vitrine/:id", element: <AccessGuard allowedRoles={["client"]}><Vitrine /></AccessGuard> },
  { path: "/client/panier", element: <AccessGuard allowedRoles={["client"]}><Panier /></AccessGuard> },
  { path: "/client/commandes", element: <AccessGuard allowedRoles={["client"]}><CommandesClient /></AccessGuard> },
  { path: "/client/profil", element: <AccessGuard allowedRoles={["client"]}><ProfilCommun /></AccessGuard> },
  { path: "/client/messages", element: <AccessGuard allowedRoles={["client"]}><MessagesClient /></AccessGuard> },
];

const vendeurRoutes = [
  { path: "/vendeur/dashboard", element: <AccessGuard allowedRoles={["vendeur"]}><DashboardVendeur /></AccessGuard> },
  { path: "/vendeur/produits", element: <AccessGuard allowedRoles={["vendeur"]}><Produits /></AccessGuard> },
  { path: "/vendeur/commandes", element: <AccessGuard allowedRoles={["vendeur"]}><CommandesVendeur /></AccessGuard> },
  { path: "/vendeur/profil", element: <AccessGuard allowedRoles={["vendeur"]}><ProfilCommun /></AccessGuard> },
  { path: "/vendeur/messages", element: <AccessGuard allowedRoles={["vendeur"]}><MessagesVendeur /></AccessGuard> },
];

const livreurRoutes = [
  { path: "/livreur/dashboard", element: <AccessGuard allowedRoles={["livreur"]}><DashboardLivreur /></AccessGuard> },
  { path: "/livreur/courses", element: <AccessGuard allowedRoles={["livreur"]}><Courses /></AccessGuard> },
  { path: "/livreur/historique", element: <AccessGuard allowedRoles={["livreur"]}><Historique /></AccessGuard> },
  { path: "/livreur/profil", element: <AccessGuard allowedRoles={["livreur"]}><ProfilCommun /></AccessGuard> },
  { path: "/livreur/messages", element: <AccessGuard allowedRoles={["livreur"]}><MessagesLivreur /></AccessGuard> },
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