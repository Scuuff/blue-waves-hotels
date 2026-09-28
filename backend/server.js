import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRouts.js";
import reviewRoutes from "./routes/review.js";
import profileRoutes from "./routes/profileRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";

// middlewares
import { globalMiddlewares } from "./MiddleWares/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5050;

// global middleware
globalMiddlewares(app);

// test route
app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/auth", authRoutes);
app.use("/hotels", hotelRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/profile", profileRoutes);
app.use("/newsletter", newsletterRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/newsletter", newsletterRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });