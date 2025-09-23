
import { config } from "../config/env.js";

export const sendToken = (res, user, message, statusCode = 200) => {
  const token = user.getJWTToken();
  const isProduction = config.NODE_ENV === 'production';

  const roleCookieMap = {
    SUPER_ADMIN: { name: "super_admin_token" },
    MANAGER: { name: "manager_token" },
    STAFF: { name: "staff_token" },
    DELIVERY: { name: "delivery_token" },
    CUSTOMER: { name: "customer_token" },
  };

  const { name } = roleCookieMap[user.role] || { name: "user_token" };

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'None',      // cross-site
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // Role-specific token
  res.cookie(name, token, cookieOptions);

  // last_active_role cookie
  res.cookie("last_active_role", user.role, {
    ...cookieOptions,
    httpOnly: false, // client can read for UI / query param
  });

  // send response
  res.status(statusCode).json({
    success: true,
    message,
    user,
  });
};

