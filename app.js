import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorMiddleware } from "./Middleware/Error.js";
import Order from "./Models/Order.model.js";
import routes from "./Router/index.js";
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://zayka-express-six.vercel.app",
  "https://zayka-nu.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
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
app.use(cookieParser());
app.use(helmet());
app.use(compression()); //Benefit: Faster page load, lower bandwidth.

//home route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Food Delivery API",
  });
});

// All Routes
app.use("/api/v1", routes);

const clear = async () => {
  await Order.deleteMany();
  console.log("Orders  Cleared")
}



//error middleware
app.use(errorMiddleware);

export default app;
