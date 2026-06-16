import { useMemo, useState } from "react";
import { imageSrc, formatPrice } from "../api/client";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Lightbox from "./Lightbox";

function getProductImages(product) {
  let images = product.images?.length ? product.images : product.image ? [product.image] : [];
  images = [...new Set(images.filter(Boolean))];
  return images;
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const images = useMemo(() => getProductImages(product), [product]);
  const mainImage = images[activeImage] || images[0];
  const outOfStock = product.stock === "out";
  const hasGallery = images.length > 1;

  const handleAdd = () => {
    if (outOfStock) {
      showToast("This item is currently out of stock");
      return;
    }
    addItem(product);
    showToast(`${product.name} added to cart`);
  };

  const openGallery = () => {
    if (!images.length) return;
    setLightboxOpen(true);
  };

  return (
    <>
      <div className={`product ${outOfStock ? "out-of-stock" : ""}`}>
        <div className="product-media">
          {hasGallery && (
            <span className="photo-count-badge">{images.length} photos</span>
          )}
          <img
            className={hasGallery ? "main-image" : ""}
            src={imageSrc(mainImage)}
            alt={product.name}
            loading="lazy"
            onClick={openGallery}
          />
          {hasGallery && (
            <div className="thumbnails">
              {images.map((img, i) => (
                <img
                  key={`${img}-${i}`}
                  src={imageSrc(img)}
                  alt={`${product.name} angle ${i + 1}`}
                  className={i === activeImage ? "active" : ""}
                  onClick={() => setActiveImage(i)}
                />
              ))}
            </div>
          )}
        </div>
        <h3>{product.name}</h3>
        <p>₦{formatPrice(product.price)}</p>
        {product.condition && <p className="condition">{product.condition}</p>}
        {hasGallery && (
          <p className="gallery-hint">Tap photos to view all angles</p>
        )}
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
