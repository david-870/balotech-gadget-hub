import { imageSrc } from "../api/client";

const MAX_PHOTOS = 8;

export default function AdminImageGallery({ images, onChange, onUpload, uploading }) {
  const setCover = (index) => {
    if (index === 0) return;
    const next = [...images];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next);
  };

  const removeAt = (index) => {
    onChange(images.filter((_, i) => i !== index));
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
          {images.length}/{MAX_PHOTOS} — add different angles for customers
        </span>
      </label>

      {images.length > 0 ? (
        <div className="admin-image-grid">
          {images.map((img, index) => (
            <div key={`${img}-${index}`} className="admin-image-tile">
              <img src={imageSrc(img)} alt={`Product photo ${index + 1}`} />
              {index === 0 && <span className="admin-cover-badge">Cover</span>}
              <div className="admin-image-tile-actions">
                {index !== 0 && (
                  <button type="button" className="admin-tile-btn" onClick={() => setCover(index)}>
                    Set cover
                  </button>
                )}
                <button
                  type="button"
                  className="admin-tile-btn danger"
                  onClick={() => removeAt(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-image-preview empty">
          <p>No photos yet — add at least one</p>
        </div>
      )}

      {images.length < MAX_PHOTOS && (
        <div className="admin-image-actions">
          <label className={`admin-btn ${uploading ? "disabled" : ""}`}>
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
          <label className={`admin-btn ${uploading ? "disabled" : ""}`}>
            🖼 Add Photos
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
