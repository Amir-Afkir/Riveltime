import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom"; // ← import
import Card from "../../components/ui/Card";
import Section from "../../components/ui/Section";
import Title from "../../components/ui/Title";
import Button from "../../components/ui/Button";

export default function Panier() {
  const { cart, removeFromCart, placeOrder } = useCart();
  const navigate = useNavigate(); // ← hook

  const totalArticles = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  const handleOrder = () => {
    placeOrder();
    navigate("/client/commandes"); // ← redirection automatique
  };

  return (
    <>
      {cart.length === 0 ? (
        <Title level={4} className="text-center text-gray-500">
          Votre panier est vide.
        </Title>
      ) : (
        <>
          <div className="space-y-2 mb-6">
            {cart.map((item, index) => (
              <Card key={index} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">
                    {item.quantity} × {item.product.name}
                  </span>
                  <br />
                  <small className="text-gray-500">chez {item.merchant}</small>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {(item.product.price * item.quantity).toFixed(2)} €
                  </span>
                  <Button
                    onClick={() => removeFromCart(item)}
                    variant="danger"
                    size="small"
                  >
                    X
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Section title="Résumé">
            <div className="flex justify-between mb-4">
              <span>Total</span>
              <span>{totalPrice.toFixed(2)} €</span>
            </div>
            <Button onClick={handleOrder} className="w-full">
              Commander
            </Button>
          </Section>
        </>
      )}
    </>
  );
}