import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorMiddleware } from "./Middleware/Error.js";
import routes from "./Router/index.js";

const app = express();

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://zayka-express-six.vercel.app",
  "https://zayka-nu.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🔍 Incoming request from origin:", origin);

      if (!origin || allowedOrigins.includes(origin)) {
        console.log("✅ Allowed origin:", origin || "No Origin (Postman/curl)");
        callback(null, true);
      } else {
        console.warn("❌ Blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ FIXED as array
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middlewares
app.use(cookieParser());
app.use(helmet());
app.use(compression()); // Faster response, less bandwidth

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Food Delivery API 🚀",
  });
});

//API Routes
app.use("/api/v1", routes);



//Error middleware (last)
app.use(errorMiddleware);

export default app;
