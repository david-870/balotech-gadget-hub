const STORAGE_KEY = "balotech-cart";
const STOCK_KEY = "balotech-stock";
const ADMIN_MODE_KEY = "balotech-admin-mode";
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

function getImageKeyword(productName) {
  const name = productName.toLowerCase();
  if (name.includes("iphone")) return `${productName} phone`;
  if (name.includes("samsung")) return `${productName} phone`;
  if (name.includes("redmi") || name.includes("infinix") || name.includes("tecno") || name.includes("itel")) {
    return `${productName} smartphone`;
  }
  if (name.includes("macbook")) return `${productName} laptop`;
  if (name.includes("lenovo") || name.includes("dell") || name.includes("hp")) return `${productName} laptop`;
  if (name.includes("watch")) return `${productName} smartwatch`;
  if (name.includes("airpods") || name.includes("earbuds")) return `${productName} earbuds`;
  if (name.includes("headphone") || name.includes("sony") || name.includes("jbl") || name.includes("soundcore")) {
    return `${productName} headphones`;
  }
  if (name.includes("power bank")) return `${productName} power bank`;
  if (name.includes("playstation") || name.includes("controller") || name.includes("gaming")) return `${productName} gaming`;
  return productName;
}

// function applyProductImages() {
//   document.querySelectorAll(".product").forEach((product) => {
//     const name = product.dataset.name || "";
//     const image = product.querySelector("img");
//     if (!image) return;

//     const isPlaceholder = image.src.includes("via.placeholder.com");
//     if (!isPlaceholder) return;

//     const keyword = getImageKeyword(name);
//     image.src = `https://source.unsplash.com/300x300/?${encodeURIComponent(keyword)}`;
//     image.loading = "lazy";
//   });
// }

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

  const existing = cart.find((item) => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    const condition = product.dataset.condition || '';
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
    text.textContent = `${item.name} x${item.qty} - ₦${formatPrice(itemTotal)}`;

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

  let message = "Hello, I want to place an order from your gadget catalog:\n";
  let total = 0;

  cart.forEach((item) => {
    const lineTotal = item.price * item.qty;
    message += `- ${item.name} x${item.qty} (₦${formatPrice(lineTotal)})\n`;
    total += lineTotal;
  });

 message += `- ${item.name} x${item.qty} (₦${formatPrice(lineTotal)}) — ${item.condition || 'New'}\nPlease confirm availability and delivery details.`;

  const phoneNumber = "08157742329"; // replace with your real business number
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  window.location.href = url;
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
  applyProductImages();
  displayCart();
});