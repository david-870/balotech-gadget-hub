import { useState } from "react";
import { imageSrc, formatPrice } from "../api/client";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Lightbox from "./Lightbox";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const images =
    product.images?.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];
  const mainImage = images[activeImage] || product.image;
  const outOfStock = product.stock === "out";

  const handleAdd = () => {
    if (outOfStock) {
      showToast("This item is currently out of stock");
      return;
    }
    addItem(product);
    showToast(`${product.name} added to cart`);
  };

  return (
    <>
      <div className={`product ${outOfStock ? "out-of-stock" : ""}`}>
        {images.length > 1 ? (
          <>
            <img
              className="main-image"
              src={imageSrc(mainImage)}
              alt={product.name}
              loading="lazy"
              onClick={() => setLightboxOpen(true)}
            />
            <div className="thumbnails">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={imageSrc(img)}
                  alt={`${product.name} view ${i + 1}`}
                  className={i === activeImage ? "active" : ""}
                  onClick={() => setActiveImage(i)}
                />
              ))}
            </div>
          </>
        ) : (
          <img
            src={imageSrc(mainImage)}
            alt={product.name}
            loading="lazy"
            onClick={() => images.length && setLightboxOpen(true)}
          />
        )}
        <h3>{product.name}</h3>
        <p>₦{formatPrice(product.price)}</p>
        {product.condition && <p className="condition">{product.condition}</p>}
        <span className={`status ${outOfStock ? "out" : "in"}`}>
          {outOfStock ? "Out of Stock" : "In Stock"}
        </span>
        <button
          className="add-to-cart"
          type="button"
          disabled={outOfStock}
          onClick={handleAdd}
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={images.map(imageSrc)}
          startIndex={activeImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
