import { useEffect, useState } from "react";
import { api } from "../api/client";
import ProductCard from "./ProductCard";

export default function ProductGrid({ category, title, subtitle }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .getProducts(category)
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <>
      {(title || subtitle) && (
        <section className="hero">
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </section>
      )}

      {loading && <p className="page-status">Loading products...</p>}
      {error && <p className="page-status error">{error}</p>}

      <section className="products">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </>
  );
}
