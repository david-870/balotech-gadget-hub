import { Routes, Route, Navigate } from "react-router-dom";
import ShopLayout from "./components/ShopLayout";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { CATEGORIES, ADMIN_GATEWAY_PATH } from "./constants";

export default function App() {
  return (
    <Routes>
      <Route path={`/${ADMIN_GATEWAY_PATH}`} element={<Admin />} />
      <Route path="/admin" element={<NotFound />} />
      <Route path="/admin/*" element={<NotFound />} />
      <Route element={<ShopLayout />}>
        <Route path="/" element={<Home />} />
        {CATEGORIES.filter((c) => c.id !== "hot-deals").map((cat) => (
          <Route
            key={cat.id}
            path={cat.path}
            element={<CategoryPage categoryId={cat.id} />}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
