import { useEffect, useState } from "react";
import { imageSrc } from "../api/client";

const MAX_PHOTOS = 8;

export default function AdminImageGallery({ images, onChange, onUpload, uploading }) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const safeIndex = Math.min(previewIndex, Math.max(images.length - 1, 0));
  const preview = images[safeIndex];

  useEffect(() => {
    setPreviewIndex((index) => Math.min(index, Math.max(images.length - 1, 0)));
  }, [images.length]);

  const setCover = (index) => {
    if (index === 0) {
      setPreviewIndex(0);
      return;
    }
    const next = [...images];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next);
    setPreviewIndex(0);
  };

  const removeAt = (index) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
    setPreviewIndex(Math.min(safeIndex, Math.max(next.length - 1, 0)));
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const slotsLeft = MAX_PHOTOS - images.length;
    if (slotsLeft <= 0) return;
    await onUpload(files.slice(0, slotsLeft));
  };

  return (
    <div className="admin-image-section">
      <label>
        Product photos
        <span className="admin-photo-count">
          {images.length}/{MAX_PHOTOS} · first photo is the shop cover
        </span>
      </label>

      {images.length > 0 ? (
        <div className="admin-gallery-editor">
          <div className="admin-cover-preview">
            <img src={imageSrc(preview)} alt="Preview" />
            {safeIndex === 0 && <span className="admin-cover-badge">Cover</span>}
          </div>

          {images.length > 1 && (
            <div className="thumbnails admin-thumbnails">
              {images.map((img, index) => (
                <div key={`${img}-${index}`} className="admin-thumb-item">
                  <img
                    src={imageSrc(img)}
                    alt={`Photo ${index + 1}`}
                    className={index === safeIndex ? "active" : ""}
                    onClick={() => setPreviewIndex(index)}
                  />
                  <button
                    type="button"
                    className="admin-thumb-remove"
                    aria-label={`Remove photo ${index + 1}`}
                    onClick={() => removeAt(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {safeIndex > 0 && (
            <button
              type="button"
              className="admin-btn ghost admin-set-cover-btn"
              onClick={() => setCover(safeIndex)}
            >
              Use this as cover photo
            </button>
          )}

          {images.length === 1 && (
            <button
              type="button"
              className="admin-btn danger admin-remove-single"
              onClick={() => removeAt(0)}
            >
              Remove photo
            </button>
          )}
        </div>
      ) : (
        <div className="admin-image-preview empty">
          <p>Add photos of different angles</p>
        </div>
      )}

      {images.length < MAX_PHOTOS && (
        <div className="admin-image-actions">
          <label className={`admin-btn admin-photo-btn ${uploading ? "disabled" : ""}`}>
            📷 Take Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              disabled={uploading}
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          <label className={`admin-btn admin-photo-btn ${uploading ? "disabled" : ""}`}>
            🖼 Add More Photos
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={uploading}
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}

export function normalizeProductImages(image, images) {
  let list = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!list.length && image) list = [image];
  list = [...new Set(list)];
  return { image: list[0] || "", images: list };
}
