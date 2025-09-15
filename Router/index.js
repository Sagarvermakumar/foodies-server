import { Router } from "express";
import { generalLimiter } from "../Middleware/rateLimit.js";
import addressRouter from "./address.routes.js";
import authRouter from "./auth.routes.js";
import cartRouter from "./cart.routes.js";
import categoryRouter from "./category.routes.js";
import couponRouter from './coupon.routes.js';
import deliveryRouter from "./deliver.routes.js";
import itemRouter from "./item.routes.js";
import notificationRouter from "./notification.routes.js";
import orderRouter from "./order.routes.js";
import outletRouter from "./outlet.routes.js";
import reportRouter from "./report.routes.js";
import reviewRouter from "./review.routes.js";
import userRouter from "./user.routes.js";

const routers = Router();

// 🔐 Auth Routes (Sensitive - login/signup)
routers.use("/auth",  authRouter);

// 🧑‍💻 User Routes
routers.use("/user", generalLimiter, userRouter);

// 🏠 Address Routes
routers.use("/address", generalLimiter, addressRouter);

// ☺️ Outlet Routers
routers.use("/outlet", generalLimiter, outletRouter);

// 😁 Category Routers
routers.use("/category", categoryRouter);

// 🍽️ Item Routers
routers.use("/item",  itemRouter);

// 🎟 Coupons Routers
routers.use("/coupon", generalLimiter, couponRouter);

// 🛒 Cart Routers
routers.use("/cart", generalLimiter, cartRouter);

// 🛒 Order Routers
routers.use("/order",  orderRouter);

// 🚵‍♀️ Delivery Routers
routers.use("/delivery", generalLimiter, deliveryRouter);

// 👍 Review Routers
routers.use("/review", generalLimiter, reviewRouter);

// 🚉 Report Routers
routers.use("/report", generalLimiter, reportRouter);

// 🔔 Notification Routers
routers.use("/notification", generalLimiter, notificationRouter);





export default routers;
