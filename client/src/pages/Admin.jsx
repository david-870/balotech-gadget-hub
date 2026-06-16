import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatPrice } from "../api/client";
import { CATEGORIES } from "../constants";
import { useToast } from "../context/ToastContext";
import OrderHistory from "../components/OrderHistory";
import AdminProductList from "../components/AdminProductList";
import AdminImageGallery, { normalizeProductImages } from "../components/AdminImageGallery";

const emptyForm = (category = "iphones") => ({
  name: "",
  price: "",
  condition: "",
  category,
  stock: "in",
  image: "",
  images: [],
});

export default function Admin() {
  const { showToast } = useToast();
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("balotech-admin-token"));
  const [pin, setPin] = useState("");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [uploadingImages, setUploadingImages] = useState(false);
  const [tab, setTab] = useState("products");
  const [categoryTab, setCategoryTab] = useState("hot-deals");
  const [orders, setOrders] = useState([]);

  const activeCategory = CATEGORIES.find((c) => c.id === categoryTab);

  const loadProducts = () => {
    api
      .getProducts()
      .then((data) => setProducts(data.products))
      .catch((err) => showToast(err.message));
  };

  const loadOrders = () => {
    api
      .getOrders()
      .then((data) => setOrders(data.orders))
      .catch((err) => showToast(err.message));
  };

  useEffect(() => {
    if (loggedIn) {
      loadProducts();
      loadOrders();
    }
  }, [loggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { token } = await api.login(pin);
      localStorage.setItem("balotech-admin-token", token);
      setLoggedIn(true);
      showToast("Welcome back");
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("balotech-admin-token");
    setLoggedIn(false);
  };

  const openModal = (product = null) => {
    if (product) {
      const { image, images } = normalizeProductImages(product.image, product.images);
      setEditing(product);
      setForm({
        name: product.name,
        price: product.price,
        condition: product.condition || "",
        category: product.category,
        stock: product.stock,
        image,
        images,
      });
    } else {
      setEditing(null);
      setForm(emptyForm(categoryTab));
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm(categoryTab));
  };

  const handleUploadImages = async (files) => {
    setUploadingImages(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { url } = await api.uploadImage(file);
        uploaded.push(url);
      }
      setForm((f) => {
        const images = [...f.images, ...uploaded];
        return { ...f, images, image: images[0] || "" };
      });
      showToast(
        uploaded.length === 1 ? "Photo added" : `${uploaded.length} photos added`
      );
    } catch (err) {
      showToast(err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { image, images } = normalizeProductImages(form.image, form.images);
    const body = {
      name: form.name.trim(),
      price: Number(form.price),
      condition: form.condition.trim(),
      category: form.category,
      stock: form.stock,
      image,
      images,
    };

    try {
      if (editing) {
        await api.updateProduct(editing.id, body);
        showToast("Product updated");
      } else {
        await api.createProduct(body);
        showToast("Product added");
      }
      closeModal();
      loadProducts();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    if (!confirm(`Delete "${editing.name}"? This removes it from the catalogue.`)) return;
    try {
      await api.deleteProduct(editing.id);
      showToast("Product deleted");
      closeModal();
      loadProducts();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleToggleStock = async (product) => {
    const newStock = product.stock === "out" ? "in" : "out";
    try {
      await api.updateProduct(product.id, { stock: newStock });
      loadProducts();
      showToast(
        `${product.name} → ${newStock === "in" ? "In Stock" : "Out of Stock"}`
      );
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleChangePin = async () => {
    const currentPin = prompt("Enter current PIN:");
    if (!currentPin) return;
    const newPin = prompt("Enter new PIN (min 4 characters):");
    if (!newPin || newPin.length < 4) {
      showToast("PIN must be at least 4 characters");
      return;
    }
    try {
      await api.changePin(currentPin, newPin);
      showToast("PIN updated");
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleOrderStatus = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      loadOrders();
      showToast("Order status updated");
    } catch (err) {
      showToast(err.message);
    }
  };

  const categoryProducts = products.filter((p) => {
    if (p.category !== categoryTab) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.condition || "").toLowerCase().includes(q)
    );
  });

  if (!loggedIn) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <h1>BaloTech Admin</h1>
          <p>Manage your product catalogue from your phone.</p>
          <form onSubmit={handleLogin}>
            <label htmlFor="adminPin">Admin PIN</label>
            <input
              id="adminPin"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              required
            />
            <button type="submit" className="admin-btn primary">
              Sign In
            </button>
          </form>
          <p className="admin-hint">Authorized personnel only.</p>
          <Link to="/" className="admin-link">
            ← Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div>
          <h1>Catalogue Admin</h1>
          <p>
            {products.length} products · {orders.length} orders
          </p>
        </div>
        <button type="button" className="admin-btn ghost" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${tab === "products" ? "active" : ""}`}
          onClick={() => setTab("products")}
        >
          Products
        </button>
        <button
          type="button"
          className={`admin-tab ${tab === "orders" ? "active" : ""}`}
          onClick={() => setTab("orders")}
        >
          Order History
        </button>
      </div>

      {tab === "orders" ? (
        <OrderHistory orders={orders} onStatusChange={handleOrderStatus} />
      ) : (
        <>
          <div className="admin-category-tabs">
            {CATEGORIES.map((cat) => {
              const count = products.filter((p) => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`admin-category-tab ${categoryTab === cat.id ? "active" : ""}`}
                  onClick={() => setCategoryTab(cat.id)}
                >
                  {cat.label}
                  <span className="admin-category-count">{count}</span>
                </button>
              );
            })}
          </div>

          <section className="admin-category-section">
            <div className="admin-category-header">
              <h2>{activeCategory?.label}</h2>
              <p>{categoryProducts.length} products</p>
            </div>

            <div className="admin-toolbar">
              <input
                type="search"
                placeholder={`Search ${activeCategory?.label}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="button" className="admin-btn primary" onClick={() => openModal()}>
                + Add to {activeCategory?.label}
              </button>
            </div>

            <div className="admin-actions">
              <button type="button" className="admin-btn ghost" onClick={handleChangePin}>
                Change PIN
              </button>
              <Link to="/" className="admin-btn">
                View Shop
              </Link>
            </div>

            <AdminProductList
              products={categoryProducts}
              categoryLabel={activeCategory?.label}
              onEdit={openModal}
              onToggleStock={handleToggleStock}
              onAdd={() => openModal()}
            />
          </section>
        </>
      )}

      {tab === "products" && modalOpen && (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className="admin-modal-backdrop" onClick={closeModal} />
          <div className="admin-modal-sheet">
            <div className="admin-modal-header">
              <h2>{editing ? "Edit Product" : "Add Product"}</h2>
              <button type="button" className="admin-icon-btn" onClick={closeModal}>
                ✕
              </button>
            </div>
            <form className="admin-form" onSubmit={handleSave}>
              <label>
                Product name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Price (₦)
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </label>
              <label>
                Condition
                <textarea
                  rows={2}
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                />
              </label>
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Stock status
                <select
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                >
                  <option value="in">In Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </label>
              <AdminImageGallery
                images={form.images}
                uploading={uploadingImages}
                onChange={(images) =>
                  setForm((f) => ({ ...f, images, image: images[0] || "" }))
                }
                onUpload={handleUploadImages}
              />
              <div className="admin-form-actions">
                {editing && (
                  <button type="button" className="admin-btn danger" onClick={handleDelete}>
                    Delete (Sold)
                  </button>
                )}
                <button type="submit" className="admin-btn primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

