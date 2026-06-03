const STORAGE_KEY = "balotech-cart";
const STOCK_KEY = "balotech-stock";
const ADMIN_MODE_KEY = "balotech-admin-mode";

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

let cart = loadCart();
let stockOverrides = loadStockOverrides();
let adminMode = loadAdminMode();

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function loadStockOverrides() {
  try {
    const saved = localStorage.getItem(STOCK_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveStockOverrides() {
  localStorage.setItem(STOCK_KEY, JSON.stringify(stockOverrides));
}

function loadAdminMode() {
  return localStorage.getItem(ADMIN_MODE_KEY) === "true";
}

function saveAdminMode() {
  localStorage.setItem(ADMIN_MODE_KEY, adminMode ? "true" : "false");
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-NG").format(value);
}

function getImagesBase() {
  return window.location.pathname.includes("/pages/") ? "../Images/" : "Images/";
}

function imageUrl(filename) {
  return getImagesBase() + encodeURIComponent(filename);
}

function applyLocalProductImages() {
  document.querySelectorAll(".product").forEach((product) => {
    const name = (product.dataset.name || "").toLowerCase();
    const image = product.querySelector(".main-image"); product.querySelector(":not(.thumbnails) > img");
    const filename = PRODUCT_IMAGES[name];
    if (!image || !filename) return;

    const isPlaceholder =
      !image.dataset.localImage &&
      (image.src.includes("via.placeholder.com") || image.src.includes("placeholder"));
    if (isPlaceholder || image.dataset.localImage === "pending") {
      image.src = imageUrl(filename);
      image.dataset.localImage = "true";
      image.loading = "lazy";
      image.onerror = () => {
        image.alt = `${product.dataset.name} (image unavailable)`;
      };
    }
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1400);
}

function addToCart(button) {
  const product = button.closest(".product");
  if (!product) return;
  const stock = getProductStock(product);
  if (stock === "out") {
    showToast("This item is currently out of stock");
    return;
  }

  const name = product.dataset.name;
  const price = Number(product.dataset.price);
  if (!name || Number.isNaN(price)) return;

  const condition = product.dataset.condition || "";
  const existing = cart.find((item) => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1, condition });
  }

  saveCart();
  displayCart();
  showToast(`${name} added to cart`);
}

function displayCart() {
  const cartItems = document.getElementById("cartItems");
  const total = document.getElementById("total");
  const cartCount = document.getElementById("cartCount");

  if (!cartItems || !total) return;

  cartItems.innerHTML = "";
  let sum = 0;
  let totalQty = 0;

  cart.forEach((item) => {
    const li = document.createElement("li");
    const itemTotal = item.price * item.qty;
    li.className = "cart-item";

    const text = document.createElement("span");
    const conditionNote = item.condition ? ` (${item.condition})` : "";
    text.textContent = `${item.name} x${item.qty} - ₦${formatPrice(itemTotal)}${conditionNote}`;

    const removeButton = document.createElement("button");
    removeButton.className = "remove-btn";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeFromCart(item.name));

    li.appendChild(text);
    li.appendChild(removeButton);
    cartItems.appendChild(li);
    sum += itemTotal;
    totalQty += item.qty;
  });

  total.textContent = `Total: ₦${formatPrice(sum)}`;
  if (cartCount) cartCount.textContent = String(totalQty);
}

function removeFromCart(name) {
  const index = cart.findIndex((item) => item.name === name);
  if (index === -1) return;

  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
    showToast(`Removed one ${name}`);
  } else {
    cart.splice(index, 1);
    showToast(`${name} removed from cart`);
  }

  saveCart();
  displayCart();
}

function checkout() {
  if (cart.length === 0) {
    showToast("Cart is empty");
    return;
  }

  let message = "Hello, I want to place an order from BaloTech Gadget Hub:\n";
  let total = 0;

  cart.forEach((item) => {
    const lineTotal = item.price * item.qty;
    const conditionText = item.condition ? ` — ${item.condition}` : "";
    message += `- ${item.name} x${item.qty} (₦${formatPrice(lineTotal)})${conditionText}\n`;
    total += lineTotal;
  });

  message += `\nTotal: ₦${formatPrice(total)}\n\nPlease confirm availability and delivery details.`;

  const phoneNumber = "2348157742329";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function getProductStock(product) {
  const key = product.dataset.name || "";
  const fallback = product.dataset.stock || "in";
  return stockOverrides[key] || fallback;
}

function updateProductStockUi(product) {
  const stock = getProductStock(product);
  const button = product.querySelector(".add-to-cart");
  const status = product.querySelector(".status");
  if (!button || !status) return;

  product.classList.toggle("out-of-stock", stock === "out");
  button.disabled = stock === "out";
  button.textContent = stock === "out" ? "Out of Stock" : "Add to Cart";
  status.classList.remove("in", "out");
  status.classList.add(stock === "out" ? "out" : "in");
  status.textContent = stock === "out" ? "Out of Stock" : "In Stock";
}

function toggleProductStock(product) {
  const key = product.dataset.name || "";
  if (!key) return;
  const current = getProductStock(product);
  stockOverrides[key] = current === "out" ? "in" : "out";
  saveStockOverrides();
  updateProductStockUi(product);
}

function refreshAdminControls() {
  document.querySelectorAll(".stock-toggle").forEach((button) => {
    button.style.display = adminMode ? "inline-block" : "none";
  });
  const adminToggle = document.getElementById("adminModeToggle");
  if (adminToggle) {
    adminToggle.textContent = adminMode ? "Admin: ON" : "Admin: OFF";
    adminToggle.classList.toggle("active", adminMode);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  // Bug 1 (lines ~167-195): thumbnail code was duplicated and nested 
  // inside the product forEach loop — moved it outside and cleaned to one copy
  document.querySelectorAll(".thumbnails img").forEach(thumb => {
    thumb.addEventListener("click", () => {
      const product = thumb.closest(".product");
      const mainImage = product.querySelector(".main-image");

      mainImage.classList.add("fade");

      setTimeout(() => {
        mainImage.src = thumb.src;
        mainImage.classList.remove("fade");
      }, 300);

      product.querySelectorAll(".thumbnails img").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });
// Lightbox viewer
let lightboxImages = [];
let lightboxIndex = 0;

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxDots = document.getElementById("lightboxDots");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");

function openLightbox(images, startIndex) {
  lightboxImages = images;
  lightboxIndex = startIndex;
  updateLightbox();
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}

function updateLightbox() {
  lightboxImg.src = lightboxImages[lightboxIndex];
  lightboxDots.innerHTML = "";
  lightboxImages.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "lightbox-dot" + (i === lightboxIndex ? " active" : "");
    dot.addEventListener("click", () => {
      lightboxIndex = i;
      updateLightbox();
    });
    lightboxDots.appendChild(dot);
  });
}

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

if (lightboxPrev) lightboxPrev.addEventListener("click", () => {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  updateLightbox();
});

if (lightboxNext) lightboxNext.addEventListener("click", () => {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  updateLightbox();
});

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "ArrowLeft") {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightbox();
  }
  if (e.key === "ArrowRight") {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    updateLightbox();
  }
  if (e.key === "Escape") closeLightbox();
});

// attach click to open lightbox on main images
document.querySelectorAll(".product").forEach(product => {
  const mainImg = product.querySelector(".main-image") || product.querySelector("img");
  if (!mainImg) return;

  mainImg.addEventListener("click", () => {
    const thumbs = product.querySelectorAll(".thumbnails img");
    const images = thumbs.length > 0
      ? Array.from(thumbs).map(t => t.src)
      : [mainImg.src];

    const currentSrc = mainImg.src;
    const startIndex = Math.max(images.findIndex(src => src === currentSrc), 0);
    openLightbox(images, startIndex);
  });
});
  // Bug 2 (line ~167): product forEach was wrapping the thumbnail code
  // — stock toggle logic now runs cleanly on its own
  document.querySelectorAll(".product").forEach((product) => {
    const button = product.querySelector(".add-to-cart");
    if (!button) return;

    const toggle = document.createElement("button");
    toggle.className = "stock-toggle";
    toggle.type = "button";
    toggle.textContent = "Toggle Stock";
    toggle.addEventListener("click", () => {
      toggleProductStock(product);
      showToast("Stock status updated");
    });
    product.appendChild(toggle);
    updateProductStockUi(product);
  });

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => addToCart(button));
  });

  const adminToggle = document.getElementById("adminModeToggle");
  if (adminToggle) {
    adminToggle.addEventListener("click", () => {
      adminMode = !adminMode;
      saveAdminMode();
      refreshAdminControls();
      showToast(adminMode ? "Admin stock mode enabled" : "Admin stock mode disabled");
    });
  }

  refreshAdminControls();
  applyLocalProductImages();
  displayCart();
});
   
