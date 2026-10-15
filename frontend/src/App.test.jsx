import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { App } from "./main";
const catalog = [
  {
    id: 1,
    name: "Everyday Backpack",
    category: "Carry",
    price: 28,
    stock: 18,
    image: "/images/bag.jpg",
    description: "An everyday backpack.",
  },
  {
    id: 2,
    name: "Quiet Morning Mug",
    category: "Home",
    price: 18,
    stock: 24,
    image: "/images/mug.jpg",
    description: "A ceramic mug.",
  },
  {
    id: 6,
    name: "Unwind Headphones",
    category: "Desk",
    price: 68,
    stock: 0,
    image: "/images/headphones.jpg",
    description: "Over-ear headphones.",
  },
];
beforeEach(() => {
  localStorage.clear();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ items: catalog, total: 3 }),
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
async function shop() {
  render(<App />);
  await screen.findByRole("button", { name: "View Quiet Morning Mug" });
}
it("loads products from API", async () => {
  await shop();
  expect(fetch).toHaveBeenCalledWith(
    "/api/products?pageSize=50",
    expect.any(Object),
  );
  expect(
    screen.getByRole("button", { name: "View Everyday Backpack" }),
  ).toBeInTheDocument();
});
it("searches and clears an empty result", async () => {
  await shop();
  fireEvent.change(screen.getByRole("textbox", { name: "Search products" }), {
    target: { value: "missing" },
  });
  expect(screen.getByText("No essentials found.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "See all essentials" }));
  expect(
    screen.getByRole("button", { name: "View Quiet Morning Mug" }),
  ).toBeInTheDocument();
});
it("filters by category", async () => {
  await shop();
  fireEvent.click(screen.getByRole("button", { name: "Home", exact: true }));
  expect(
    screen.queryByRole("button", { name: "View Everyday Backpack" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "View Quiet Morning Mug" }),
  ).toBeInTheDocument();
});
it("sorts by price", async () => {
  await shop();
  fireEvent.change(screen.getByRole("combobox", { name: "Sort products" }), {
    target: { value: "price-asc" },
  });
  expect(screen.getAllByRole("article")[0]).toHaveTextContent(
    "Quiet Morning Mug",
  );
});
it("prevents buying sold out products", async () => {
  await shop();
  expect(
    screen.getByRole("button", { name: "Currently unavailable" }),
  ).toBeDisabled();
});
it("shows product details", async () => {
  await shop();
  fireEvent.click(
    screen.getByRole("button", { name: "View Quiet Morning Mug" }),
  );
  expect(
    screen.getByRole("dialog", { name: "Quiet Morning Mug" }),
  ).toHaveTextContent("A ceramic mug.");
});
it("shows an empty bag", async () => {
  await shop();
  fireEvent.click(
    screen.getByRole("button", { name: "Open shopping bag, 0 items" }),
  );
  expect(screen.getByText("Your bag is empty.")).toBeInTheDocument();
});
it("persists bag and changes quantities", async () => {
  await shop();
  fireEvent.click(screen.getAllByRole("button", { name: "Add to bag" })[0]);
  expect(JSON.parse(localStorage.getItem("akhila-bag"))).toEqual([
    { id: 1, quantity: 1 },
  ]);
  fireEvent.click(
    screen.getByRole("button", { name: "Open shopping bag, 1 items" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Increase Everyday Backpack" }),
  );
  expect(JSON.parse(localStorage.getItem("akhila-bag"))[0].quantity).toBe(2);
  fireEvent.click(
    screen.getByRole("button", { name: "Remove Everyday Backpack" }),
  );
  expect(screen.getByText("Your bag is empty.")).toBeInTheDocument();
});
it("requires a name and sends only ids and quantities", async () => {
  await shop();
  fireEvent.click(screen.getAllByRole("button", { name: "Add to bag" })[1]);
  fireEvent.click(
    screen.getByRole("button", { name: "Open shopping bag, 1 items" }),
  );
  expect(
    screen.getByRole("button", { name: "Place demo order" }),
  ).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Name for your demo order"), {
    target: { value: "Sample" },
  });
  fetch.mockImplementation(async (path) => ({
    ok: true,
    json: async () =>
      path === "/api/orders"
        ? {
            id: "11111111-1111-4111-8111-111111111111",
            subtotal: 18,
            shipping: 5,
            total: 23,
            items: [
              {
                productId: 2,
                productName: "Quiet Morning Mug",
                quantity: 1,
                unitPrice: 18,
              },
            ],
          }
        : { items: catalog, total: 3 },
  }));
  fireEvent.click(screen.getByRole("button", { name: "Place demo order" }));
  await screen.findByText("Your demo order has been saved.");
  const call = fetch.mock.calls.find((c) => c[0] === "/api/orders");
  const body = JSON.parse(call[1].body);
  expect(body.items).toEqual([{ productId: 2, quantity: 1 }]);
  expect(body).not.toHaveProperty("total");
  expect(body.requestId).toMatch(/^[a-f0-9-]{36}$/);
  expect(localStorage.getItem("akhila-bag")).toBe("[]");
});
it("shows a service error with retry", async () => {
  fetch.mockRejectedValue(new Error("Service unavailable"));
  render(<App />);
  await screen.findByText("The collection couldn’t load.");
  expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
});
