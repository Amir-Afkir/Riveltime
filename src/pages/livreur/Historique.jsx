import BottomNav from "../../components/BottomNav";

export default function Historique() {
  const courses = [
    {
      id: 1,
      date: "27/05/2025",
      merchant: "Épicerie Bio",
      address: "12 rue des Lilas",
      status: "Livrée",
      payment: 5.00,
    },
    {
      id: 2,
      date: "26/05/2025",
      merchant: "Fleuriste L'Orchidée",
      address: "45 avenue Jean Jaurès",
      status: "Livrée",
      payment: 6.50,
    },
  ];

  return (
    <div className="min-h-screen bg-orange-50 pb-28">
      <header className="bg-orange-600 text-white p-4 text-center text-xl font-semibold">
        Historique des courses
      </header>
      <div className="p-4 max-w-md mx-auto space-y-4">
        {courses.map(course => (
          <div key={course.id} className="bg-white p-4 rounded shadow">
            <p className="font-medium text-gray-800">{course.date}</p>
            <p className="text-sm text-gray-600">Commerçant : {course.merchant}</p>
            <p className="text-sm text-gray-600">Client : {course.address}</p>
            <p className="text-sm text-green-600 font-semibold">Statut : {course.status}</p>
            <p className="text-sm text-gray-800">Rémunération : {course.payment.toFixed(2)} €</p>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}