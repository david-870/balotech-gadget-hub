export const CATEGORIES = [
  { id: "hot-deals", label: "Hot Deals", path: "/" },
  { id: "iphones", label: "iPhones", path: "/iphones" },
  { id: "samsung", label: "Samsung", path: "/samsung" },
  { id: "other-phones", label: "Other Phones", path: "/other-phones" },
  { id: "laptops", label: "Laptops", path: "/laptops" },
  { id: "watches", label: "Watches", path: "/watches" },
  { id: "audio", label: "Audio", path: "/audio" },
  { id: "accessories", label: "Accessories", path: "/accessories" },
  { id: "gaming", label: "Gaming", path: "/gaming" },
];

export const WHATSAPP_NUMBER = "2348157742329";

export const ADMIN_GATEWAY_PATH =
  import.meta.env.VITE_ADMIN_GATEWAY_PATH || "balotech-vault-x9k2";

export const ADMIN_GATEWAY_SECRET =
  import.meta.env.VITE_ADMIN_GATEWAY_SECRET || "";

export const ORDER_STATUSES = [
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id);
}
