import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CATEGORIES } from "../constants";

export default function Header() {
  const { totalQty } = useCart();

  return (
    <header>
      <h1>
        <Link to={CATEGORIES.find((c) => c.home)?.path || "/"}>
          BaloTech Gadget Hub
        </Link>
      </h1>
      <nav>
        <NavLink to={CATEGORIES.find((c) => c.home)?.path || "/"} end>
          Home
        </NavLink>
        {CATEGORIES.filter((c) => !c.home).map((cat) => (
          <NavLink key={cat.id} to={cat.path}>
            {cat.label}
          </NavLink>
        ))}
        <a href="#cart">
          Cart <span className="cart-count">{totalQty}</span>
        </a>
      </nav>
    </header>
  );
}
