// src/components/OrderCard.jsx
import React from 'react';
import Card from './Card';
import Title from './Title';
import Badge from './Badge';

export default function OrderCard({ order }) {
  const colorMap = {
    "en attente": "gray",
    "en cours": "blue",
    "presque": "yellow",
    "terminée": "green",
  };

  return (
    <Card className="space-y-2">
      <Title level={3}>Commande du {order.date}</Title>
      <Title level={4} className="text-sm text-gray-500">
        {order.items.length} article(s) – {order.total.toFixed(2)} €
      </Title>
      <ul className="text-xs space-y-1">
        {order.items.map((i, idx) => (
          <li key={idx}>{i.quantity}× {i.product.name} chez {i.merchant}</li>
        ))}
      </ul>
      <Badge color={colorMap[order.status] || 'gray'}>
        Statut : {order.status}
      </Badge>
    </Card>
  );
}