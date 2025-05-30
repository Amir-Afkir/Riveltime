import Section from "../ui/Section";
import Title from "../ui/Title";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

export default function UserProfileSections({ user, role }) {
  const navigate = useNavigate();
  return (
    <>
      {role === "client" && user.client && (
      <Section>
        <Title level={2}>Mes informations</Title>
        <p><strong>Nom :</strong> {user.client.nom}</p>
        <p><strong>Email :</strong> {user.client.email}</p>
        <p><strong>Téléphone :</strong> {user.client.telephone}</p>
        <Button
          variant="primary" 
          className="w-full"
          onClick={() => navigate("")}>
          Modifier mes informations
        </Button>
      </Section>
      )}

      {role === "vendeur" && user.boutique && (
        <Section>
          <Title level={2}>Informations de la boutique</Title>
          <p><strong>Nom :</strong> {user.boutique.nom}</p>
          <p><strong>Catégorie :</strong> {user.boutique.categorie}</p>
          <p><strong>Siret :</strong> {user.boutique.siret}</p>
          <p><strong>Email :</strong> {user.boutique.email}</p>
          <p><strong>Téléphone :</strong> {user.boutique.telephone}</p>
          <p><strong>Adresse :</strong> {user.boutique.adresse}</p>
          <p><strong>Horaires :</strong> {user.boutique.horaires}</p>   
          <Button 
            variant="success" 
            className="w-full"
            onClick={() => navigate("/vendeur/boutique")}>
            Modifier mes informations
          </Button> 
        </Section>    
      )}

      {role === "livreur" && user.zone && (
        <Section>
          <Title level={2}>Société de livraison</Title>
          <p><strong>Nom :</strong> {user.nom}</p>
          <p><strong>Email :</strong> {user.email}</p>
          <p><strong>Téléphone :</strong> {user.telephone}</p>
          <p><strong>Siret :</strong> {user.siret}</p>
          <p><strong>Zone :</strong> {user.zone}</p>
          <Button 
            variant="orange" 
            className="w-full"
            onClick={() => navigate("")}>
            Modifier mes informations
          </Button>
        </Section>
      )}

      <Section>
        <Title level={2}>Préférences</Title>
        <div className="flex items-center justify-between">
          <span>Notifications</span>
          <input type="checkbox" checked={user.notifications} readOnly />
        </div>
      </Section>

      <Section>
        <Title level={2}>Paramètres</Title>
        <div className="space-y-2">
          <Button variant="link" className="w-full text-left">Changer de mot de passe</Button>
          <Button variant="link" className="w-full text-left text-red-600">Se déconnecter</Button>
          <Button variant="link" className="w-full text-left text-red-600">Supprimer mon compte</Button>
        </div>
      </Section>
    </>
  );
}