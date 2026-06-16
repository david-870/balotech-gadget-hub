import { Link } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import Cart from "../components/Cart";
import { CATEGORIES } from "../constants";

export default function Home() {
  const shopCategories = CATEGORIES.filter((c) => !c.home);

  return (
    <>
      <section className="hero">
        <h2>Welcome to BaloTech Gadget Hub</h2>
        <p>
          Start with our hot deals — limited stock and fast-selling offers in
          Nigeria. Checkout directly via WhatsApp.
        </p>
      </section>

      <section className="hot-deals" id="hot-deals">
        <h2>Hot Deals</h2>
        <p>Limited stock and fast-selling offers.</p>
      </section>

      <ProductGrid category="hot-deals" />

      <section className="shop-categories">
        <h2>Shop by Category</h2>
        <p>Browse our full catalog beyond today&apos;s deals.</p>
        <div className="page-links">
          {shopCategories.map((cat) => (
            <Link key={cat.id} to={cat.path}>
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      <Cart />

      <section id="contact" className="cart">
        <h2>Contact Us</h2>
        <p>Call/WhatsApp: 08157742329</p>
      </section>
    </>
  );
}
