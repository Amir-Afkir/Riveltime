// src/pages/client/Vitrine.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import Layout from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import Section from "../../components/ui/Section";
import Title from "../../components/ui/Title";
import Card from "../../components/ui/Card";

export default function Vitrine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [merchant, setMerchant] = useState(null);

  useEffect(() => {
    fetch("/src/data/merchants.json")
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((m) => m.id === parseInt(id, 10));
        setMerchant(found);
      });
  }, [id]);

  if (!merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100">
        <p className="text-red-600">Commerçant introuvable</p>
      </div>
    );
  }

  return (
    <Layout title={merchant.name} showBack={true} backTo="/client" showCart={false} color="blue">
      <Section>
        <Title level={2}>Catégorie : {merchant.category}</Title>
      </Section>

      <ul className="space-y-2">
        {merchant.products.map((product, index) => (
          <Card key={index} className="flex justify-between items-center">
            <div>
              <span className="font-medium">{product.name}</span>
              <br />
              <span className="text-sm text-gray-500">
                {product.price.toFixed(2)} €
              </span>
            </div>
            <Button
              onClick={() => addToCart({ merchant: merchant.name, product })}
              className="ml-4 text-sm"
            >
              Ajouter
            </Button>
          </Card>
        ))}
      </ul>

      <Button
        onClick={() => navigate("/client/panier")}
        className="mt-6 w-full"
      >
        Voir le panier
      </Button>
    </Layout>
  );
}
