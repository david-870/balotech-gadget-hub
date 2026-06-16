import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { productCount, createProduct } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..", "..");
const legacyImagesDir = path.join(rootDir, "Images");

const PRODUCT_IMAGES = {
  "iphone x": "WhatsApp Image 2026-05-22 at 2.40.24 AM.jpeg",
  "iphone xr": "WhatsApp Image 2026-05-22 at 2.40.30 AM.jpeg",
  "iphone xs-max": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 11": "WhatsApp Image 2026-05-22 at 2.40.31 AM.jpeg",
  "iphone 11 pro": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 11 pro max": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 12": "WhatsApp Image 2026-05-22 at 2.40.34 AM.jpeg",
  "iphone 12 mini": "WhatsApp Image 2026-05-22 at 2.40.34 AM.jpeg",
  "iphone 12 pro": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 12 pro max": "WhatsApp Image 2026-05-22 at 2.40.31 AM.jpeg",
  "iphone 13": "WhatsApp Image 2026-05-22 at 2.40.24 AM.jpeg",
  "iphone 13 mini": "WhatsApp Image 2026-05-22 at 2.40.24 AM.jpeg",
  "iphone 13 pro": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 13 pro max": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 14": "WhatsApp Image 2026-05-22 at 2.40.30 AM.jpeg",
  "iphone 14 plus": "WhatsApp Image 2026-05-22 at 2.40.30 AM.jpeg",
  "iphone 14 pro": "WhatsApp Image 2026-05-22 at 2.40.32 AM.jpeg",
  "iphone 14 pro max": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 15": "WhatsApp Image 2026-05-22 at 2.40.24 AM.jpeg",
  "iphone 15 plus": "WhatsApp Image 2026-05-22 at 2.40.27 AM.jpeg",
  "iphone 15 pro": "WhatsApp Image 2026-05-22 at 2.40.32 AM.jpeg",
  "iphone 15 pro max": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 16": "WhatsApp Image 2026-05-22 at 2.36.18 AM.jpeg",
  "iphone 16 plus": "WhatsApp Image 2026-05-22 at 2.40.27 AM.jpeg",
  "iphone 16 pro": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 16 pro max": "WhatsApp Image 2026-05-22 at 2.36.18 AM.jpeg",
  "iphone 17": "WhatsApp Image 2026-05-22 at 2.40.27 AM.jpeg",
  "iphone 17 plus": "WhatsApp Image 2026-05-22 at 2.40.27 AM.jpeg",
  "iphone 17 pro": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 17 pro max": "WhatsApp Image 2026-05-22 at 2.36.17 AM.jpeg",
  "infinix note 40": "WhatsApp Image 2026-05-22 at 2.40.20 AM.jpeg",
};

function resolveImage(image, name) {
  if (!image || image.includes("placeholder")) {
    const filename = PRODUCT_IMAGES[(name || "").toLowerCase()];
    if (filename) return `/legacy-images/${encodeURIComponent(filename)}`;
    return "";
  }
  if (image.startsWith("./Images/") || image.startsWith("../Images/")) {
    const filename = path.basename(image);
    return `/legacy-images/${encodeURIComponent(filename)}`;
  }
  if (image.startsWith("http")) return image;
  return image;
}

function resolveImages(images, name, fallbackImage) {
  const list = images?.length ? images : fallbackImage ? [fallbackImage] : [];
  return list.map((img) => resolveImage(img, name)).filter(Boolean);
}

export async function seedIfEmpty() {
  const count = await productCount();
  if (count > 0) {
    console.log(`Database already has ${count} products. Skipping seed.`);
    return;
  }

  const productsPath = path.join(rootDir, "products.json");
  if (!fs.existsSync(productsPath)) {
    console.warn("products.json not found — skipping seed.");
    return;
  }

  const { products } = JSON.parse(fs.readFileSync(productsPath, "utf8"));
  console.log(`Seeding ${products.length} products...`);

  for (const p of products) {
    const image = resolveImage(p.image, p.name);
    const images = resolveImages(p.images, p.name, p.image);
    await createProduct({
      name: p.name,
      price: p.price,
      condition: p.condition || "",
      category: p.category,
      stock: p.stock || "in",
      image: image || images[0] || "",
      images,
    });
  }

  console.log("Seed complete.");
}

const isMain = process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  if (!fs.existsSync(legacyImagesDir)) {
    console.warn("Legacy Images folder not found at", legacyImagesDir);
  }
  seedIfEmpty().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
