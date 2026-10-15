import { describe, it, expect } from "vitest";
import { restoreCart, setQuantity, totals } from "./cart";
describe("bag behavior", () => {
  it("recovers from corrupt storage", () =>
    expect(restoreCart("bad")).toEqual([]));
  it("rejects invalid and duplicate entries", () =>
    expect(
      restoreCart(
        '[null,{"id":1,"quantity":2},{"id":1,"quantity":3},{"id":2,"quantity":-1}]',
      ),
    ).toEqual([{ id: 1, quantity: 2 }]));
  it("adds item", () =>
    expect(setQuantity([], 1, 2, 5)).toEqual([{ id: 1, quantity: 2 }]));
  it("caps at stock", () =>
    expect(setQuantity([], 1, 8, 2)[0].quantity).toBe(2));
  it("caps at ten", () =>
    expect(setQuantity([], 1, 20, 100)[0].quantity).toBe(10));
  it("removes item", () =>
    expect(setQuantity([{ id: 1, quantity: 1 }], 1, 0, 5)).toEqual([]));
  it("rejects out of stock", () =>
    expect(setQuantity([], 1, 1, 0)).toEqual([]));
  it("computes subtotal and shipping", () =>
    expect(totals([{ price: 18, quantity: 2 }])).toEqual({
      subtotal: 36,
      shipping: 5,
      total: 41,
    }));
  it("free shipping at 75", () =>
    expect(totals([{ price: 25, quantity: 3 }]).shipping).toBe(0));
  it("empty bag has zero total", () => expect(totals([]).total).toBe(0));
});
