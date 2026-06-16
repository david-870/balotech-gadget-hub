import { Router } from "express";
import { createOrder, getAllOrders, getOrderById, updateOrderStatus } from "../db.js";
import { authMiddleware } from "../auth.js";

const router = Router();
const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

router.post("/", async (req, res) => {
  try {
    const { items, total, customerName, customerPhone, notes } = req.body;
    if (!items?.length || total == null) {
      return res.status(400).json({ error: "items and total are required" });
    }

    const order = await createOrder({
      items: items.map((item) => ({
        productId: item.productId ?? item.id,
        name: item.name,
        price: Number(item.price),
        qty: Number(item.qty) || 1,
        condition: item.condition || "",
      })),
      total: Number(total),
      customerName: customerName?.trim() || "",
      customerPhone: customerPhone?.trim() || "",
      notes: notes?.trim() || "",
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (_req, res) => {
  try {
    const orders = await getAllOrders();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const order = await updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
