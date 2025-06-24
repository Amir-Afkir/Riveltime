// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/common/Home';
import ProfilCommun from '../pages/common/Profil'; // ✅ Profil commun

// Client
import ClientAccueil from '../pages/client/Accueil';
import Vitrine from '../pages/client/Vitrine';
import Panier from '../pages/client/Panier';
import CommandesClient from '../pages/client/Commandes';
import MessagesClient from '../pages/client/Messages';

// Vendeur
import DashboardVendeur from '../pages/vendeur/Dashboard';
import Produits from '../pages/vendeur/Produits';
import CommandesVendeur from '../pages/vendeur/Commandes';
import MessagesVendeur from '../pages/vendeur/Messages';

// Livreur
import DashboardLivreur from '../pages/livreur/Dashboard';
import Courses from '../pages/livreur/Courses';
import Historique from '../pages/livreur/Historique';
import MessagesLivreur from '../pages/livreur/Messages';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Client */}
      <Route path="/client/accueil" element={<ClientAccueil />} />
      <Route path="/vitrine/:id" element={<Vitrine />} />
      <Route path="/client/panier" element={<Panier />} />
      <Route path="/client/commandes" element={<CommandesClient />} />
      <Route path="/client/profil" element={<ProfilCommun />} />
      <Route path="/client/messages" element={<MessagesClient />} />

      {/* Vendeur */}
      <Route path="/vendeur/dashboard" element={<DashboardVendeur />} />
      <Route path="/vendeur/produits" element={<Produits />} />
      <Route path="/vendeur/commandes" element={<CommandesVendeur />} />
      <Route path="/vendeur/profil" element={<ProfilCommun />} />
      <Route path="/vendeur/messages" element={<MessagesVendeur />} />

      {/* Livreur */}
      <Route path="/livreur/dashboard" element={<DashboardLivreur />} />
      <Route path="/livreur/courses" element={<Courses />} />
      <Route path="/livreur/historique" element={<Historique />} />
      <Route path="/livreur/profil" element={<ProfilCommun />} />
      <Route path="/livreur/messages" element={<MessagesLivreur />} />
    </Routes>
  );
}