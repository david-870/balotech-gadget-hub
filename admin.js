const {
  CATEGORIES,
  formatPrice,
  resolveImageUrl,
  loadCatalog,
  saveLocalCatalog,
  publishCatalog,
  generateId,
  isAdminLoggedIn,
  loginAdmin,
  logoutAdmin,
  getAdminPin,
  setAdminPin,
  exportCatalogFile,
  readImageFile,
  compressImage,
} = window.BaloCatalog;

let catalog = { products: [], version: 1 };
let editingProduct = null;
let pendingImage = null;

const loginScreen = document.getElementById("loginScreen");
const adminApp = document.getElementById("adminApp");
const loginForm = document.getElementById("loginForm");
const productList = document.getElementById("productList");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");

function showToast(message) {
  const toast = document.getElementById("adminToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function showApp() {
  loginScreen.classList.add("hidden");
  adminApp.classList.remove("hidden");
}

function showLogin() {
  adminApp.classList.add("hidden");
  loginScreen.classList.remove("hidden");
}

function populateCategorySelects() {
  [categoryFilter, document.getElementById("editCategory")].forEach((select) => {
    if (!select) return;
    const isFilter = select === categoryFilter;
    if (isFilter) {
      select.innerHTML = '<option value="">All categories</option>';
    } else {
      select.innerHTML = "";
    }
    CATEGORIES.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.label;
      select.appendChild(option);
    });
  });
}

function getCategoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label || id;
}

function filteredProducts() {
  const query = (searchInput.value || "").trim().toLowerCase();
  const category = categoryFilter.value;
  return catalog.products.filter((product) => {
    const matchesCategory = !category || product.category === category;
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      (product.condition || "").toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
}

function renderProductList() {
  const products = filteredProducts();
  document.getElementById("productCount").textContent = `${catalog.products.length} products`;
  productList.innerHTML = "";

  if (!products.length) {
    productList.innerHTML = '<p class="admin-hint">No products match your search.</p>';
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "admin-product-card";
    const imgSrc = resolveImageUrl(product.image, product.name);
    const stock = product.stock === "out" ? "out" : "in";

    card.innerHTML = `
      <img src="${imgSrc}" alt="${product.name}" loading="lazy" />
      <div class="admin-product-info">
        <h3>${product.name}</h3>
        <p class="price">₦${formatPrice(product.price)}</p>
        <p>${getCategoryLabel(product.category)}</p>
        <span class="badge ${stock}">${stock === "out" ? "Out of Stock" : "In Stock"}</span>
      </div>
      <button class="admin-edit-btn" type="button" data-id="${product.id}">Edit</button>
    `;

    card.querySelector(".admin-edit-btn").addEventListener("click", () => openEditModal(product.id));
    productList.appendChild(card);
  });
}

function openEditModal(id) {
  editingProduct = id ? catalog.products.find((p) => p.id === id) : null;
  pendingImage = null;

  document.getElementById("editTitle").textContent = editingProduct ? "Edit Product" : "Add Product";
  document.getElementById("editId").value = editingProduct?.id || "";
  document.getElementById("editName").value = editingProduct?.name || "";
  document.getElementById("editPrice").value = editingProduct?.price || "";
  document.getElementById("editCondition").value = editingProduct?.condition || "";
  document.getElementById("editCategory").value = editingProduct?.category || "iphones";
  document.getElementById("editStock").value = editingProduct?.stock || "in";

  const deleteBtn = document.getElementById("deleteProductBtn");
  deleteBtn.classList.toggle("hidden", !editingProduct);

  const preview = document.getElementById("imagePreview");
  preview.innerHTML = "";
  if (editingProduct?.image) {
    const img = document.createElement("img");
    img.src = resolveImageUrl(editingProduct.image, editingProduct.name);
    img.alt = editingProduct.name;
    preview.appendChild(img);
  }

  editModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeEditModal() {
  editModal.classList.add("hidden");
  document.body.style.overflow = "";
  editingProduct = null;
  pendingImage = null;
  editForm.reset();
}

async function handleImageInput(file) {
  if (!file) return;
  try {
    pendingImage = await compressImage(file);
  } catch {
    showToast("Could not process image");
    return;
  }
  const preview = document.getElementById("imagePreview");
  preview.innerHTML = "";
  const img = document.createElement("img");
  img.src = pendingImage;
  img.alt = "Preview";
  preview.appendChild(img);
}

async function saveProduct(event) {
  event.preventDefault();

  const name = document.getElementById("editName").value.trim();
  const price = Number(document.getElementById("editPrice").value);
  const condition = document.getElementById("editCondition").value.trim();
  const category = document.getElementById("editCategory").value;
  const stock = document.getElementById("editStock").value;

  if (!name || Number.isNaN(price)) {
    showToast("Name and price are required");
    return;
  }

  const productData = {
    id: editingProduct?.id || generateId(catalog.products),
    name,
    price,
    condition,
    category,
    stock,
    image: pendingImage || editingProduct?.image || "",
    images: pendingImage ? [pendingImage] : editingProduct?.images,
  };

  if (editingProduct) {
    const index = catalog.products.findIndex((p) => p.id === editingProduct.id);
    if (index !== -1) catalog.products[index] = productData;
  } else {
    catalog.products.push(productData);
  }

  try {
    saveLocalCatalog(catalog);
    renderProductList();
    closeEditModal();
    showToast(editingProduct ? "Product updated" : "Product added");
  } catch {
    showToast("Could not save — storage may be full. Try Export JSON.");
  }
}

function deleteProduct() {
  if (!editingProduct) return;
  const confirmed = confirm(`Delete "${editingProduct.name}"? This removes it from the catalogue (e.g. sold).`);
  if (!confirmed) return;

  catalog.products = catalog.products.filter((p) => p.id !== editingProduct.id);
  saveLocalCatalog(catalog);
  renderProductList();
  closeEditModal();
  showToast("Product removed from catalogue");
}

async function publishChanges() {
  const pin = getAdminPin();
  const result = await publishCatalog(catalog, pin);
  if (result.method === "api") {
    showToast("Published! All visitors will see updates.");
  } else {
    showToast("Saved on this device. Tap Export JSON to update the live site.");
  }
}

function changePin() {
  const current = prompt("Enter current PIN:");
  if (current !== getAdminPin()) {
    showToast("Incorrect current PIN");
    return;
  }
  const next = prompt("Enter new PIN (at least 4 characters):");
  if (!next || next.length < 4) {
    showToast("PIN must be at least 4 characters");
    return;
  }
  setAdminPin(next);
  showToast("PIN updated");
}

async function importCatalog(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.products?.length) throw new Error("Invalid catalog file");
    catalog = data;
    saveLocalCatalog(catalog);
    renderProductList();
    showToast(`Imported ${catalog.products.length} products`);
  } catch {
    showToast("Could not import file");
  }
}

async function init() {
  populateCategorySelects();
  catalog = await loadCatalog({ preferLocal: true });

  if (isAdminLoggedIn()) {
    showApp();
    renderProductList();
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const pin = document.getElementById("adminPin").value;
    if (loginAdmin(pin)) {
      showApp();
      renderProductList();
      showToast("Welcome back");
    } else {
      showToast("Incorrect PIN");
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    logoutAdmin();
    showLogin();
  });

  searchInput.addEventListener("input", renderProductList);
  categoryFilter.addEventListener("change", renderProductList);
  document.getElementById("addProductBtn").addEventListener("click", () => openEditModal(null));
  document.getElementById("closeModalBtn").addEventListener("click", closeEditModal);
  editModal.querySelector(".admin-modal-backdrop").addEventListener("click", closeEditModal);
  editForm.addEventListener("submit", saveProduct);
  document.getElementById("deleteProductBtn").addEventListener("click", deleteProduct);
  document.getElementById("publishBtn").addEventListener("click", publishChanges);
  document.getElementById("exportBtn").addEventListener("click", () => exportCatalogFile(catalog));
  document.getElementById("changePinBtn").addEventListener("click", changePin);
  document.getElementById("cameraInput").addEventListener("change", (e) => handleImageInput(e.target.files[0]));
  document.getElementById("galleryInput").addEventListener("change", (e) => handleImageInput(e.target.files[0]));
  document.getElementById("importInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) importCatalog(file);
    e.target.value = "";
  });
}

init();
