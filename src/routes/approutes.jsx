// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/common/Home';
import ClientAccueil from '../pages/client/Accueil';
import Vitrine from '../pages/client/Vitrine';
import Panier from '../pages/client/Panier';
import CommandesClient from '../pages/client/Commandes';
import ProfilClient from '../pages/client/Profil';
import MessagesClient from '../pages/client/Messages';

import DashboardVendeur from '../pages/vendeur/Dashboard';
import Produits from '../pages/vendeur/Produits';
import CommandesVendeur from '../pages/vendeur/Commandes';
import ProfilVendeur from '../pages/vendeur/Profil';
import MessagesVendeur from '../pages/vendeur/Messages';
import MaBoutique from '../pages/vendeur/MaBoutique';

import DashboardLivreur from '../pages/livreur/Dashboard';
import Courses from '../pages/livreur/Courses';
import Historique from '../pages/livreur/Historique';
import ProfilLivreur from '../pages/livreur/Profil';
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
      <Route path="/client/profil" element={<ProfilClient />} />
      <Route path="/client/messages" element={<MessagesClient />} />

      {/* Vendeur */}
      <Route path="/vendeur/dashboard" element={<DashboardVendeur />} />
      <Route path="/vendeur/produits" element={<Produits />} />
      <Route path="/vendeur/commandes" element={<CommandesVendeur />} />
      <Route path="/vendeur/profil" element={<ProfilVendeur />} />
      <Route path="/vendeur/messages" element={<MessagesVendeur />} />
      <Route path="/vendeur/boutique" element={<MaBoutique />} />

      {/* Livreur */}
      <Route path="/livreur/dashboard" element={<DashboardLivreur />} />
      <Route path="/livreur/courses" element={<Courses />} />
      <Route path="/livreur/historique" element={<Historique />} />
      <Route path="/livreur/profil" element={<ProfilLivreur />} />
      <Route path="/livreur/messages" element={<MessagesLivreur />} />
    </Routes>
  );
}