

import { useState } from "react";
import Header from "../../components/layout/Header";
import BottomNav from "../../components/layout/BottomNav";
import Section from "../../components/ui/Section";
import Title from "../../components/ui/Title";
import Button from "../../components/ui/Button";
import BoutiqueForm from "../../components/BoutiqueForm";

export default function MaBoutique() {
  // Exemple de données simulées (à remplacer par un fetch ou un contexte global)
  const [boutique, setBoutique] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const handleSave = (newData) => {
    setBoutique(newData);
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-green-50 pb-28">
      <Header title="Ma boutique" showBack={false} color="green" />
      <div className="max-w-md mx-auto p-4 space-y-6 text-gray-700">
        {boutique && !editMode ? (
          <>
            <Section>
              <Title level={2}>{boutique.nom}</Title>
              <p><strong>Catégorie :</strong> {boutique.categorie}</p>
              <p><strong>SIRET :</strong> {boutique.siret}</p>
              <p><strong>Email :</strong> {boutique.email}</p>
              <p><strong>Téléphone :</strong> {boutique.telephone}</p>
              <p><strong>Adresse :</strong> {boutique.adresse}</p>
              <p><strong>Horaires :</strong> {boutique.horaires}</p>
              <p><strong>Site web :</strong> {boutique.siteWeb}</p>
              <p><strong>Moyens de paiement :</strong> {boutique.moyensPaiement.join(", ")}</p>
            </Section>
            <Button onClick={() => setEditMode(true)} className="w-full">Modifier ma boutique</Button>
          </>
        ) : (
          <BoutiqueForm initialData={boutique} onSave={handleSave} />
        )}
      </div>
      <BottomNav />
    </div>
  );
}