import { useState } from "react";
import Title from "../../components/ui/Title";
import Section from "../../components/ui/Section";
import Button from "../../components/ui/Button";

export default function Courses() {
  const [status, setStatus] = useState("en_attente");

  const nextStatus = {
    en_attente: "en_cours",
    en_cours: "presque",
    presque: "terminee",
    terminee: "terminee",
  };

  const statusLabels = {
    en_attente: "En attente de confirmation",
    en_cours: "Commande à récupérer",
    presque: "En route pour la livraison",
    terminee: "Commande livrée",
  };

  const handleAdvance = () => {
    setStatus(nextStatus[status]);
  };

  return (
    <div>
      <div className="p-4 max-w-md mx-auto text-center">
        <Section className="text-center">
          <Title level={2} className="mb-4">
            Suivi de livraison
          </Title>
          <Title as="p" className="text-gray-600 mb-6">
            {statusLabels[status]}
          </Title>
          {status !== "terminee" && (
            <Button
              onClick={handleAdvance}
              variant="orange" 
              className="w-full">
              Passer à l'étape suivante
            </Button>

          )}
          {status === "terminee" && (
            <Title as="p" className="text-green-600 font-semibold mt-4">
              Livraison terminée ✅
            </Title>
          )}
        </Section>
      </div>
    </div>
  );
}
