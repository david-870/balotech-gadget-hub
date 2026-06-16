import { useEffect, useState } from "react";

export default function Lightbox({ images, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [images.length, onClose]);

  return (
    <div className="lightbox open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button className="lightbox-close" type="button" onClick={onClose}>
        ✕
      </button>
      <img className="lightbox-img" src={images[index]} alt="Product view" />
      <div className="lightbox-controls">
        <button
          className="lightbox-btn"
          type="button"
          onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
        >
          ←
        </button>
        <div className="lightbox-dots">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`lightbox-dot ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          className="lightbox-btn"
          type="button"
          onClick={() => setIndex((i) => (i + 1) % images.length)}
        >
          →
        </button>
      </div>
    </div>
  );
}
