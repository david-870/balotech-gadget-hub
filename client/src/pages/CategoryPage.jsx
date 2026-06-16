import { Link } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import Cart from "../components/Cart";
import { getCategory, HOME_PATH } from "../constants";

export default function CategoryPage({ categoryId }) {
  const category = getCategory(categoryId);

  return (
    <>
      <p className="back-home">
        <Link to={HOME_PATH}>← Back to Home &amp; Hot Deals</Link>
      </p>
      <ProductGrid
        category={categoryId}
        title={`${category?.label || "Products"} Collection`}
        subtitle="Browse available stock and order via WhatsApp."
      />
      <Cart />
    </>
  );
}
