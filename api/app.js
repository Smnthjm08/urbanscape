import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import postRoute from "./routes/post.route.js";
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.route.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// --------------- Security ---------------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// --------------- Logging ---------------
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// --------------- Body Parsing ---------------
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// --------------- Rate Limiting (auth routes) ---------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// --------------- Health Check ---------------
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Urbanscape API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// --------------- Routes ---------------
app.use("/api/auth", authLimiter, authRoute);
app.use("/api/posts", postRoute);
app.use("/api/users", userRoute);

// --------------- 404 (keeps unmatched routes on the JSON envelope) ---------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// --------------- Global Error Handler (must be last) ---------------
app.use(errorHandler);

// --------------- Start Server ---------------
const port = process.env.PORT || 8800;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
