import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { prisma } from "./config/db";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middleware/auth";
import { swaggerSpec } from "./swagger";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import storeRoutes from "./routes/store.routes";
import reviewRoutes from "./routes/review.routes";
import walletRoutes from "./routes/wallet.routes";
import addressRoutes from "./routes/address.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import discountRoutes from "./routes/discount.routes";
import deliveryRoutes from "./routes/delivery.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

const start = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
