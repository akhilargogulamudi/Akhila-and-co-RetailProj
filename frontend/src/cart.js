export const money = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );
export function restoreCart(raw) {
  try {
    const a = JSON.parse(raw);
    return Array.isArray(a)
      ? a
          .filter(
            (x) =>
              x &&
              Number.isInteger(x.id) &&
              x.id > 0 &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0 &&
              x.quantity <= 10,
          )
          .filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i)
      : [];
  } catch {
    return [];
  }
}
export function setQuantity(cart, id, quantity, stock) {
  if (quantity <= 0) return cart.filter((x) => x.id !== id);
  const q = Math.min(quantity, stock, 10);
  if (q <= 0) return cart;
  return cart.some((x) => x.id === id)
    ? cart.map((x) => (x.id === id ? { id, quantity: q } : x))
    : [...cart, { id, quantity: q }];
}
export function totals(lines) {
  const subtotal =
    Math.round(lines.reduce((s, x) => s + x.price * x.quantity, 0) * 100) / 100;
  const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 5;
  return { subtotal, shipping, total: subtotal + shipping };
}
