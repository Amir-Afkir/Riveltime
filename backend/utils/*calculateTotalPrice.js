// utils/calculateTotalPrice.js
module.exports = function calculateTotalPrice(items, deliveryFee = 0, participation = 0) {
  const produitsTotal = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  return produitsTotal + deliveryFee - participation;
};