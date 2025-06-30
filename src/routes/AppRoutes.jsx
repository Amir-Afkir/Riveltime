// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/common/Home.jsx';
import Layout from '../components/layout/Layout.jsx';
import AccessGuard from '../components/logic/AccessGuard.jsx';

// 🔁 Auto-importe toutes les pages
const pageModules = import.meta.glob("../pages/**/*.jsx", { eager: true });

// 🔧 Mapping des composants
const pages = {};
for (const path in pageModules) {
  const cleanedPath = path
    .replace("../pages/", "")    // ex: client/Accueil.jsx
    .replace(".jsx", "");        // ex: client/Accueil
  pages[cleanedPath] = pageModules[path].default;
}

// 🗺️ Configuration centralisée des routes
const routesConfig = {
  client: [
    { path: "/client/accueil", key: "client/Accueil" },
    { path: "/vitrine/:id", key: "client/Vitrine" },
    { path: "/client/panier", key: "client/Panier" },
    { path: "/client/commandes", key: "client/Commandes" },
    { path: "/client/profil", key: "common/Profil" },
    { path: "/client/messages", key: "client/Messages" },
  ],
  vendeur: [
    { path: "/vendeur/dashboard", key: "vendeur/Dashboard" },
    { path: "/vendeur/produits", key: "vendeur/Produits" },
    { path: "/vendeur/commandes", key: "vendeur/Commandes" },
    { path: "/vendeur/profil", key: "common/Profil" },
    { path: "/vendeur/messages", key: "vendeur/Messages" },
  ],
  livreur: [
    { path: "/livreur/dashboard", key: "livreur/Dashboard" },
    { path: "/livreur/courses", key: "livreur/Courses" },
    { path: "/livreur/historique", key: "livreur/Historique" },
    { path: "/livreur/profil", key: "common/Profil" },
    { path: "/livreur/messages", key: "livreur/Messages" },
  ],
};

// 🔐 Génère dynamiquement les routes protégées
const protectedRoutes = Object.entries(routesConfig).flatMap(([role, routes]) =>
  routes.map(({ path, key }) => {
    const Component = pages[key];
    if (!Component) {
      console.warn(`⚠️ Composant non trouvé pour : ${key}`);
      return null;
    }
    return (
      <Route
        key={path}
        path={path}
        element={
          <AccessGuard allowedRoles={[role]}>
            <Component />
          </AccessGuard>
        }
      />
    );
  }).filter(Boolean)
);

// 🧭 Routes globales
export default function AppRoutes() {
  return (
    <Routes>
      {/* 🧱 Layout commun à toutes les pages, y compris / */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {protectedRoutes}
      </Route>
    </Routes>
  );
}