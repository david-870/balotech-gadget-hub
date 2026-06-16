import { Link } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import Cart from "../components/Cart";
import { CATEGORIES } from "../constants";

export default function Home() {
  return (
    <>
      <section className="hero">
        <h2>Welcome to BaloTech Gadget Hub</h2>
        <p>Shop top smartphones in Nigeria and checkout directly via WhatsApp.</p>
      </section>

      <div className="page-links">
        {CATEGORIES.filter((c) => c.id !== "hot-deals").map((cat) => (
          <Link key={cat.id} to={cat.path}>
            Browse {cat.label}
          </Link>
        ))}
      </div>

      <section className="hot-deals">
        <h2>Hot Deals</h2>
        <p>Limited stock and fast-selling offers.</p>
      </section>

      <ProductGrid category="hot-deals" />
      <Cart />

      <section id="contact" className="cart">
        <h2>Contact Us</h2>
        <p>Call/WhatsApp: 08157742329</p>
      </section>
    </>
  );
}
