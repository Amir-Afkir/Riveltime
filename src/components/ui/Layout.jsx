// src/components/Layout.jsx
import React from 'react';
import Header from '../Header';
import BottomNav from '../BottomNav';

export default function Layout({
  title,
  showBack = false,
  backTo,
  showCart = false,
  color = 'blue',
  bgColor,
  children
}) {
  const bg = bgColor || {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50'
  }[color] || 'bg-gray-50';

  return (
    <div className={`min-h-screen pb-28 ${bg}`}>
      <Header title={title} showBack={showBack} backTo={backTo} showCart={showCart} color={color} />
      <main className="p-4 max-w-md mx-auto">
        {children}
      </main>
      <BottomNav role={color} />
    </div>
  );
}