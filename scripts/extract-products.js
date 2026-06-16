const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const categoryMap = {
  "index.html": "hot-deals",
  "pages/iphones.html": "iphones",
  "pages/samsung.html": "samsung",
  "pages/other-phones.html": "other-phones",
  "pages/laptops.html": "laptops",
  "pages/watches.html": "watches",
  "pages/audio.html": "audio",
  "pages/accessories.html": "accessories",
  "pages/gaming.html": "gaming",
};

const products = [];
let id = 1;

for (const [file, category] of Object.entries(categoryMap)) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const regex = /<div\s+class="product"([^>]*)>([\s\S]*?)<\/div>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const attrs = match[1];
    const inner = match[2];
    const getAttr = (name) => {
      const m = attrs.match(new RegExp(`data-${name}="([^"]*)"`, "i"));
      return m ? m[1] : "";
    };
    const name = getAttr("name");
    const price = parseInt(getAttr("price") || "0", 10);
    const stock = getAttr("stock") || "in";
    const condition = getAttr("condition") || "";
    if (!name) continue;

    const imgMatch = inner.match(/<img[^>]*src="([^"]*)"[^>]*>/i);
    let image = imgMatch ? imgMatch[1] : "";
    const thumbs = [...inner.matchAll(/<div class="thumbnails">([\s\S]*?)<\/div>/gi)];
    let images = [];
    if (thumbs.length) {
      images = [...thumbs[0][1].matchAll(/src="([^"]*)"/gi)].map((m) => m[1]);
    } else if (image) {
      images = [image];
    }

    products.push({
      id: `p${id++}`,
      name,
      price,
      stock,
      condition,
      category,
      image: images[0] || "",
      images: images.length > 1 ? images : undefined,
    });
  }
}

fs.writeFileSync(
  path.join(root, "products.json"),
  JSON.stringify({ products, version: 1 }, null, 2)
);
console.log("Extracted", products.length, "products");
