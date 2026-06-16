import ProductGrid from "../components/ProductGrid";
import Cart from "../components/Cart";
import { getCategory } from "../constants";

export default function CategoryPage({ categoryId }) {
  const category = getCategory(categoryId);

  return (
    <>
      <ProductGrid
        category={categoryId}
        title={`${category?.label || "Products"} Collection`}
        subtitle="Browse available stock and order via WhatsApp."
      />
      <Cart />
    </>
  );
}
