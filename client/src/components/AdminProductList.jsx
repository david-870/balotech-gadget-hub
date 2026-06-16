import { api, formatPrice, imageSrc } from "../api/client";
import { CATEGORIES } from "../constants";

export default function AdminProductList({
  products,
  onEdit,
  onToggleStock,
  onAdd,
  categoryLabel,
}) {
  if (!products.length) {
    return (
      <div className="admin-empty-category">
        <p>No products in {categoryLabel} yet.</p>
        <button type="button" className="admin-btn primary" onClick={onAdd}>
          + Add to {categoryLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="admin-product-list">
      {products.map((product) => {
        const inStock = product.stock !== "out";
        return (
          <article key={product.id} className="admin-product-card">
            <img src={imageSrc(product.image)} alt={product.name} loading="lazy" />
            <div className="admin-product-info">
              <h3>{product.name}</h3>
              <p className="price">₦{formatPrice(product.price)}</p>
              {product.condition && <p className="condition-snippet">{product.condition}</p>}
              <span className={`badge ${inStock ? "in" : "out"}`}>
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
            <div className="admin-card-actions">
              <button
                type="button"
                className={`admin-stock-btn ${inStock ? "in" : "out"}`}
                onClick={() => onToggleStock(product)}
              >
                {inStock ? "Mark Out" : "Mark In"}
              </button>
              <button type="button" className="admin-edit-btn" onClick={() => onEdit(product)}>
                Edit
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
