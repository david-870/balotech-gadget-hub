const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const pages = {
  "pages/iphones.html": "iphones",
  "pages/samsung.html": "samsung",
  "pages/other-phones.html": "other-phones",
  "pages/laptops.html": "laptops",
  "pages/watches.html": "watches",
  "pages/audio.html": "audio",
  "pages/accessories.html": "accessories",
  "pages/gaming.html": "gaming",
};

for (const [file, category] of Object.entries(pages)) {
  const filePath = path.join(root, file);
  let html = fs.readFileSync(filePath, "utf8");

  html = html.replace(
    /<section class="products">[\s\S]*?<\/section>/,
    `<section class="products" data-catalog="${category}"></section>`
  );

  html = html.replace(
    /<button id="adminModeToggle" class="admin-toggle" type="button">Admin: OFF<\/button>/,
    `<a href="../admin.html" class="admin-link-nav">Admin</a>\n      <button id="adminModeToggle" class="admin-toggle" type="button">Quick Stock: OFF</button>`
  );

  if (!html.includes("catalog.js")) {
    html = html.replace(
      /<script src="\.\.\/script\.js"><\/script>/,
      `<script src="../catalog.js"></script>\n  <script src="../script.js"></script>`
    );
  }

  fs.writeFileSync(filePath, html);
  console.log("Updated", file);
}
