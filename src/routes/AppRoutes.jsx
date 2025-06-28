// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Home from "../pages/common/Home.jsx";
import Layout from "../components/layout/Layout.jsx";
import AccessGuard from "../components/logic/AccessGuard.jsx";

// 📦 Chargement dynamique des pages (via Vite)
const pageModules = import.meta.glob("../pages/**/*.jsx", { eager: true });

// 🔄 Transforme les modules en objets indexés par nom de fichier
const pages = {};
for (const path in pageModules) {
  const name = path.split("/").pop().replace(".jsx", "");
  pages[name] = pageModules[path].default;
}

// 📦 Définition centralisée des routes protégées par rôle
const protectedRoutes = {
  client: [
    { path: "/client/accueil", component: "Accueil" },
    { path: "/vitrine/:id", component: "Vitrine" },
    { path: "/client/panier", component: "Panier" },
    { path: "/client/commandes", component: "Commandes" },
    { path: "/client/profil", component: "Profil" },
    { path: "/client/messages", component: "Messages" },
  ],
  vendeur: [
    { path: "/vendeur/dashboard", component: "Dashboard" },
    { path: "/vendeur/produits", component: "Produits" },
    { path: "/vendeur/commandes", component: "Commandes" },
    { path: "/vendeur/profil", component: "Profil" },
    { path: "/vendeur/messages", component: "Messages" },
  ],
  livreur: [
    { path: "/livreur/dashboard", component: "Dashboard" },
    { path: "/livreur/courses", component: "Courses" },
    { path: "/livreur/historique", component: "Historique" },
    { path: "/livreur/profil", component: "Profil" },
    { path: "/livreur/messages", component: "Messages" },
  ],
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Route publique */}
      <Route path="/" element={<Home />} />

      {/* Layout partagé */}
      <Route element={<Layout />}>
        {Object.entries(protectedRoutes).flatMap(([role, routes]) =>
          routes.map(({ path, component }) => {
            const key = `${role}/${component}`;
            const FallbackKey = `common/${component}`; // Exemple pour Profil partagé
            const Component = pages[key] || pages[FallbackKey];

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
          })
        )}
      </Route>
    </Routes>
  );
}