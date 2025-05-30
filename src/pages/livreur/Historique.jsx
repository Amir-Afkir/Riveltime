import Header from "../../components/layout/Header";
import BottomNav from "../../components/layout/BottomNav";
import Section from "../../components/ui/Section";
import Title from "../../components/ui/Title";
import Card from "../../components/ui/Card";

export default function Historique() {
  const courses = [
    {
      id: 1,
      date: "27/05/2025",
      merchant: "Épicerie Bio",
      address: "12 rue des Lilas",
      status: "Livrée",
      payment: 5.0,
    },
    {
      id: 2,
      date: "26/05/2025",
      merchant: "Fleuriste L'Orchidée",
      address: "45 avenue Jean Jaurès",
      status: "Livrée",
      payment: 6.5,
    },
  ];

  return (
    <div className="min-h-screen bg-orange-50 pb-28">
      <Header title="Historique des courses" showBack={true} backTo="/livreur" color="orange" />
      <div className="p-4">
        <main className="max-w-md mx-auto space-y-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <Title level={4} className="mb-1">{course.date}</Title>
              <p className="text-sm text-gray-600">Commerçant : {course.merchant}</p>
              <p className="text-sm text-gray-600">Client : {course.address}</p>
              <p className="text-sm text-green-600 font-semibold">Statut : {course.status}</p>
              <p className="text-sm text-gray-800">Rémunération : {course.payment.toFixed(2)} €</p>
            </Card>
          ))}
        </main>
      </div>
      <BottomNav role="livreur" />
    </div>
  );
}
