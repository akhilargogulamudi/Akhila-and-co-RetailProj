import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  Search,
  X,
  Plus,
  Minus,
  Check,
  Package,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { request } from "./api";
import { restoreCart, setQuantity, totals, money } from "./cart";
import "./style.css";
export function App() {
  const [products, setProducts] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [category, setCategory] = useState("All"),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState("featured");
  const [cart, setCart] = useState(() => {
      try {
        return restoreCart(localStorage.getItem("akhila-bag"));
      } catch {
        return [];
      }
    }),
    [panel, setPanel] = useState(null),
    [selected, setSelected] = useState(null),
    [name, setName] = useState(""),
    [busy, setBusy] = useState(false),
    [checkoutError, setCheckoutError] = useState(""),
    [receipt, setReceipt] = useState(null),
    [notice, setNotice] = useState("");
  const dialog = useRef(null),
    previousFocus = useRef(null),
    retry = useRef({});
  async function load() {
    setLoading(true);
    setError("");
    try {
      setProducts((await request("/products?pageSize=50")).items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("akhila-bag", JSON.stringify(cart));
    } catch {}
  }, [cart]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2600);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (panel) {
      if (!dialog.current.open) {
        previousFocus.current = document.activeElement;
        dialog.current.showModal();
      }
    } else if (dialog.current?.open) {
      dialog.current.close();
      previousFocus.current?.focus();
    }
  }, [panel]);
  const lines = cart
      .map((c) => {
        const p = products.find((p) => p.id === c.id);
        return p ? { ...p, quantity: c.quantity } : null;
      })
      .filter(Boolean),
    amount = totals(lines),
    count = cart.reduce((s, c) => s + c.quantity, 0),
    invalid =
      lines.length !== cart.length || lines.some((l) => l.quantity > l.stock);
  const visible = products
    .filter(
      (p) =>
        (category === "All" || p.category === category) &&
        p.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : a.id - b.id,
    );
  function change(id, q, stock) {
    setCart((c) => setQuantity(c, id, q, stock));
    setCheckoutError("");
  }
  function add(p) {
    const q = cart.find((c) => c.id === p.id)?.quantity || 0;
    if (q >= Math.min(p.stock, 10)) {
      setNotice("Maximum available quantity is already in your bag.");
      return;
    }
    change(p.id, q + 1, p.stock);
    setNotice(p.name + " added to your bag.");
  }
  function close() {
    if (!busy) setPanel(null);
  }
  async function checkout(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setCheckoutError("");
    const fingerprint = JSON.stringify({ name: name.trim(), cart });
    if (retry.current.fingerprint !== fingerprint)
      retry.current = { fingerprint, id: crypto.randomUUID() };
    try {
      const order = await request("/orders", {
        method: "POST",
        body: JSON.stringify({
          requestId: retry.current.id,
          customerName: name.trim(),
          items: cart.map((c) => ({ productId: c.id, quantity: c.quantity })),
        }),
      });
      setReceipt(order);
      setCart([]);
      setPanel("receipt");
      retry.current = {};
      await load();
    } catch (e) {
      setCheckoutError(e.message);
      await load();
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="announcement">
        A little less ordinary. <span>Free demo shipping on orders $75+</span>
      </div>
      <header>
        <a className="wordmark" href="#">
          Akhila &amp; Co.<span>EVERYDAY, THOUGHTFULLY CHOSEN</span>
        </a>
        <nav>
          <a href="#collection">The collection</a>
          <button onClick={() => setPanel("project")}>
            Behind the build <ArrowUpRight size={14} />
          </button>
        </nav>
        <button
          className="bag-button"
          onClick={() => setPanel("bag")}
          aria-label={`Open shopping bag, ${count} items`}
        >
          <ShoppingBag size={20} />
          <span>Bag</span>
          <b>{count}</b>
        </button>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">THE EVERYDAY COLLECTION / 01</p>
            <h1>
              Good things.
              <br />
              For <em>ordinary days.</em>
            </h1>
            <p>
              Small essentials that make your desk, your home, and your day feel
              a little more considered.
            </p>
            <a className="primary" href="#collection">
              Find your everyday <ArrowRight size={18} />
            </a>
            <p className="hero-foot">CARRY WELL. WORK WELL. UNWIND.</p>
          </div>
          <div className="hero-image">
            <img
              src="/images/mug.jpg"
              alt="A ceramic mug for everyday coffee rituals"
            />
            <div className="image-label">
              <span>A MOMENT TO SLOW DOWN</span>
              <p>The everyday ritual.</p>
            </div>
            <span className="edition">
              AKHILA &amp; CO.
              <br />
              VOL. 001
            </span>
          </div>
        </section>
        <section className="benefits">
          <span>
            <Package size={18} /> A small, considered collection
          </span>
          <span>
            <Truck size={18} /> Free demo shipping over $75
          </span>
          <span>
            <ShieldCheck size={18} /> Demo checkout · no real payment
          </span>
        </section>
        <section className="collection" id="collection">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LESS, BUT LOVELIER</p>
              <h2>Your everyday favorites.</h2>
            </div>
            <p>Made for the things you do every day.</p>
          </div>
          <div className="toolbar">
            <div
              className="categories"
              role="group"
              aria-label="Filter products"
            >
              {["All", "Carry", "Desk", "Home"].map((c) => (
                <button
                  key={c}
                  className={category === c ? "active" : ""}
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c === "All" ? "All essentials" : c}
                </button>
              ))}
            </div>
            <div className="find">
              <label className="search">
                <Search size={16} />
                <input
                  aria-label="Search products"
                  value={search}
                  placeholder="Find an essential"
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>
          {loading && !products.length ? (
            <div className="empty" role="status">
              Gathering the good things…
            </div>
          ) : error ? (
            <div className="empty" role="alert">
              <h3>The collection couldn’t load.</h3>
              <p>{error}</p>
              <button className="primary" onClick={load}>
                Try again
              </button>
            </div>
          ) : (
            <>
              <p className="result-count">{visible.length} essentials</p>
              <div className="product-grid">
                {visible.map((p) => (
                  <article className="product" key={p.id}>
                    <button
                      className="product-photo"
                      aria-label={`View ${p.name}`}
                      onClick={() => {
                        setSelected(p);
                        setPanel("product");
                      }}
                    >
                      <img src={p.image} alt={p.name} loading="lazy" />
                      {p.stock <= 7 && (
                        <span className="badge">
                          {p.stock ? `Only ${p.stock} left` : "Back soon"}
                        </span>
                      )}
                      <span className="quick-view">
                        Take a closer look <ArrowUpRight size={16} />
                      </span>
                    </button>
                    <div className="product-meta">
                      <span>{p.category}</span>
                      <span>{money(p.price)}</span>
                    </div>
                    <h3>
                      <button
                        onClick={() => {
                          setSelected(p);
                          setPanel("product");
                        }}
                      >
                        {p.name}
                      </button>
                    </h3>
                    <button
                      className="add"
                      disabled={!p.stock}
                      onClick={() => add(p)}
                    >
                      {p.stock ? "Add to bag" : "Currently unavailable"}
                      <Plus size={16} />
                    </button>
                  </article>
                ))}
              </div>
              {visible.length === 0 && (
                <div className="empty">
                  <h3>No essentials found.</h3>
                  <p>Try another search or explore the full collection.</p>
                  <button
                    className="primary"
                    onClick={() => {
                      setSearch("");
                      setCategory("All");
                    }}
                  >
                    See all essentials
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        <section className="note">
          <p className="eyebrow">A NOTE FROM AKHILA</p>
          <h2>
            A simple shop.
            <br />
            <em>A thoughtful backend.</em>
          </h2>
          <p>
            This retail learning project brings together the work I enjoy: clear
            shopping experiences, APIs, database transactions, and reliable
            inventory updates.
          </p>
          <button onClick={() => setPanel("project")}>
            Explore the project <ArrowUpRight size={16} />
          </button>
        </section>
      </main>
      <footer>
        <a className="wordmark" href="#">
          Akhila &amp; Co.
        </a>
        <p>
          Akhila Gogulamudi · Retail portfolio project
          <br />
          Demo products and orders. No purchases or deliveries.
        </p>
        <a
          href="https://www.linkedin.com/in/akhila-gogulamudi-507426182/"
          target="_blank"
          rel="noreferrer"
        >
          Meet the developer <ArrowUpRight size={14} />
        </a>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
        </div>
      )}
      <dialog
        ref={dialog}
        aria-label={
          panel === "product"
            ? selected?.name
            : panel === "project"
              ? "About this project"
              : panel === "receipt"
                ? "Order confirmation"
                : "Shopping bag"
        }
        onCancel={(e) => {
          if (busy) e.preventDefault();
          else setPanel(null);
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <div className="dialog-inner">
          <button
            className="close"
            aria-label="Close dialog"
            disabled={busy}
            onClick={close}
          >
            <X />
          </button>
          {panel === "product" && selected && (
            <div className="detail">
              <img src={selected.image} alt={selected.name} />
              <p className="eyebrow">{selected.category}</p>
              <h2>{selected.name}</h2>
              <p className="detail-price">{money(selected.price)}</p>
              <p>{selected.description}</p>
              <p>
                {selected.stock
                  ? `${selected.stock} available · Maximum 10 per order`
                  : "Currently out of stock"}
              </p>
              <button
                className="primary full"
                disabled={!selected.stock}
                onClick={() => add(selected)}
              >
                {selected.stock ? "Add to bag" : "Back soon"}
                <ShoppingBag size={18} />
              </button>
            </div>
          )}
          {panel === "project" && (
            <div className="project-info">
              <p className="eyebrow">A PERSONAL LEARNING PROJECT</p>
              <h2>Behind the edit.</h2>
              <p>
                A retail application for Akhila Gogulamudi’s portfolio,
                designed to be studied, tested,
                and extended hands-on.
              </p>
              <dl>
                <dt>Frontend</dt>
                <dd>React · responsive CSS · accessible dialogs</dd>
                <dt>Backend</dt>
                <dd>C# · ASP.NET Core · REST APIs</dd>
                <dt>Database</dt>
                <dd>SQL Server · EF Core · relational constraints</dd>
                <dt>Checkout</dt>
                <dd>
                  Server-owned prices, atomic inventory updates, and retry-safe
                  requests.
                </dd>
              </dl>
              <p className="muted">
                A demonstration shop. No payment processing, accounts, or
                fulfillment.
              </p>
            </div>
          )}
          {panel === "bag" && (
            <>
              <p className="eyebrow">THE GOOD THINGS YOU PICKED</p>
              <h2>
                Your bag <span className="muted">({count})</span>
              </h2>
              {!cart.length ? (
                <div className="empty">
                  <ShoppingBag size={38} />
                  <h3>A little room for something good.</h3>
                  <p>Your bag is empty.</p>
                  <button className="primary" onClick={close}>
                    Explore the collection
                  </button>
                </div>
              ) : (
                <>
                  <div className="bag-items">
                    {lines.map((l) => (
                      <div className="bag-item" key={l.id}>
                        <img src={l.image} alt="" />
                        <div>
                          <h3>{l.name}</h3>
                          <p>{money(l.price)}</p>
                          <div className="quantity">
                            <button
                              aria-label={`Decrease ${l.name}`}
                              onClick={() =>
                                change(l.id, l.quantity - 1, l.stock)
                              }
                            >
                              <Minus size={14} />
                            </button>
                            <span>{l.quantity}</span>
                            <button
                              aria-label={`Increase ${l.name}`}
                              disabled={l.quantity >= Math.min(l.stock, 10)}
                              onClick={() =>
                                change(l.id, l.quantity + 1, l.stock)
                              }
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          {l.quantity > l.stock && (
                            <p className="error">
                              Stock changed. Reduce the quantity.
                            </p>
                          )}
                        </div>
                        <button
                          className="remove"
                          aria-label={`Remove ${l.name}`}
                          onClick={() => change(l.id, 0, l.stock)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {invalid && (
                    <p role="alert" className="error">
                      Some items are unavailable. Update your bag or{" "}
                      <button onClick={() => setCart([])}>clear the bag</button>
                      .
                    </p>
                  )}
                  <div className="summary">
                    <p>
                      <span>Subtotal</span>
                      <strong>{money(amount.subtotal)}</strong>
                    </p>
                    <p>
                      <span>Demo shipping</span>
                      <span>
                        {amount.shipping ? money(amount.shipping) : "On us"}
                      </span>
                    </p>
                    <p className="total">
                      <span>Total</span>
                      <strong>{money(amount.total)}</strong>
                    </p>
                  </div>
                  <p className="shipping-note">
                    {amount.subtotal < 75
                      ? `${money(75 - amount.subtotal)} away from free demo shipping.`
                      : "Your order qualifies for free demo shipping."}
                  </p>
                  <form onSubmit={checkout}>
                    <label htmlFor="customer-name">
                      Name for your demo order
                    </label>
                    <input
                      id="customer-name"
                      className="name-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={80}
                      placeholder="e.g. Sample Shopper"
                      required
                      disabled={busy}
                    />
                    <p className="muted small">
                      Use a sample name. No card or address needed. Demo totals
                      exclude tax.
                    </p>
                    {checkoutError && (
                      <p role="alert" className="error">
                        {checkoutError}
                      </p>
                    )}
                    <button
                      className="primary full"
                      disabled={
                        busy || invalid || loading || !!error || !name.trim()
                      }
                    >
                      {busy ? "Placing your order…" : "Place demo order"}
                      <ArrowRight size={18} />
                    </button>
                  </form>
                </>
              )}
            </>
          )}
          {panel === "receipt" && receipt && (
            <div className="receipt">
              <div className="success-icon">
                <Check size={30} />
              </div>
              <p className="eyebrow">ALL SET</p>
              <h2>
                Good things,
                <br />
                on the list.
              </h2>
              <p>Your demo order has been saved.</p>
              <p className="order-ref">
                Order {receipt.id.slice(0, 8).toUpperCase()}
              </p>
              {receipt.items.map((i) => (
                <p className="receipt-line" key={i.productId}>
                  <span>
                    {i.productName} × {i.quantity}
                  </span>
                  <strong>{money(i.unitPrice * i.quantity)}</strong>
                </p>
              ))}
              <p className="receipt-line">
                <span>Demo shipping</span>
                <span>{money(receipt.shipping)}</span>
              </p>
              <p className="receipt-line total">
                <span>Total</span>
                <strong>{money(receipt.total)}</strong>
              </p>
              <p className="muted small">
                No payment was taken and nothing will be shipped.
              </p>
              <button className="primary full" onClick={close}>
                Back to the collection <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
if (document.getElementById("root"))
  createRoot(document.getElementById("root")).render(<App />);
