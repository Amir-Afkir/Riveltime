// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/common/Home.jsx';
import Layout from '../components/layout/Layout.jsx';
import AccessGuard from '../components/logic/AccessGuard.jsx';

// 📦 Auto-importation des pages
const pageModules = import.meta.glob("../pages/**/*.jsx", { eager: true });

const pages = {};
for (const path in pageModules) {
  const cleanedPath = path
    .replace("../pages/", "")
    .replace(".jsx", "");
  pages[cleanedPath] = pageModules[path].default;
}

// 🔐 Définition centralisée des routes selon le rôle et le chemin
const routesConfig = {
  client: [
    { key: "client/Accueil", path: "/client/accueil" },
    { key: "client/Vitrine", path: "/vitrine/:id" },
    { key: "client/Panier", path: "/client/panier" },
    { key: "client/Commandes", path: "/client/commandes" },
    { key: "client/Profil", path: "/client/profil" },
    { key: "client/Messages", path: "/client/messages" },
  ],
  vendeur: [
    { key: "vendeur/Dashboard", path: "/vendeur/dashboard" },
    { key: "vendeur/Produits", path: "/vendeur/produits" },
    { key: "vendeur/Commandes", path: "/vendeur/commandes" },
    { key: "vendeur/Profil", path: "/vendeur/profil" },
    { key: "vendeur/Messages", path: "/vendeur/messages" },
  ],
  livreur: [
    { key: "livreur/Dashboard", path: "/livreur/dashboard" },
    { key: "livreur/Courses", path: "/livreur/courses" },
    { key: "livreur/Historique", path: "/livreur/historique" },
    { key: "livreur/Profil", path: "/livreur/profil" },
    { key: "livreur/Messages", path: "/livreur/messages" },
  ],
};

// 🛣️ Construction des routes protégées
const protectedRoutes = Object.entries(routesConfig).flatMap(([role, routes]) =>
  routes.map(({ key, path }) => {
    const Component = pages[key];
    if (!Component) {
      console.warn(`⚠️ Composant non trouvé pour : ${key}`);
      return null;
    }

    return (
      <Route
        key={path}
        path={path}
        element={<AccessGuard allowedRoles={[role]}><Component /></AccessGuard>}
      />
    );
  }).filter(Boolean)
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🏠 Page d'accueil publique (hors layout) */}
      <Route path="/" element={<Home />} />

      {/* 🧱 Routes utilisateur avec layout commun */}
      <Route element={<Layout />}>
        {protectedRoutes}
      </Route>
    </Routes>
  );
}