import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import userRoutes from "./routes/users.js";
import platformRoutes from "./routes/platforms.js";
import learningPathRoutes from "./routes/learningPaths.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

// Health check
app.get("/api/health", async (req, res) => {
  res.json({ status: "ok" });
});

// Connect MongoDB before handling API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/platforms", platformRoutes);
app.use("/api/learning-paths", learningPathRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// IMPORTANT: Don't use app.listen() on Vercel
export default app;