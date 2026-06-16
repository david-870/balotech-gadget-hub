import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import { ensureAdminPin } from "./auth.js";
import { seedIfEmpty } from "./seed.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

const uploadsDir = path.join(__dirname, "..", "uploads");
const legacyImagesDir = path.join(__dirname, "..", "..", "Images");
const clientDist = path.join(__dirname, "..", "..", "client", "dist");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isProduction) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
        return callback(null, true);
      }
      callback(null, false);
    },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));
if (fs.existsSync(legacyImagesDir)) {
  app.use("/legacy-images", express.static(legacyImagesDir));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/categories", (_req, res) => {
  res.json({
    categories: [
      { id: "hot-deals", label: "Hot Deals" },
      { id: "iphones", label: "iPhones" },
      { id: "samsung", label: "Samsung" },
      { id: "other-phones", label: "Other Phones" },
      { id: "laptops", label: "Laptops" },
      { id: "watches", label: "Watches" },
      { id: "audio", label: "Audio" },
      { id: "accessories", label: "Accessories" },
      { id: "gaming", label: "Gaming" },
    ],
  });
});

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/auth", authRouter);

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

await ensureAdminPin(process.env.ADMIN_PIN || "7742329");
await seedIfEmpty();

app.listen(PORT, () => {
  console.log(`BaloTech running on port ${PORT}`);
});
