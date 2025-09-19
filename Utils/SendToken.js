import { config } from "../config/env.js";

export const sendToken = (res, user, message, statusCode = 200) => {
  const token = user.getJWTToken();
  const isProduction = process.env.NODE_ENV === 'production';

 const roleCookieMap = {
    SUPER_ADMIN: { name: "super_admin_token", domain: config.ADMIN_URL },
    MANAGER: { name: "manager_token", domain: config.ADMIN_URL },
    STAFF: { name: "staff_token", domain: config.ADMIN_URL },
    DELIVERY: { name: "delivery_token", domain: config.ADMIN_URL },
    CUSTOMER: { name: "customer_token", domain: config.CLIENT_URL },
  };

  const { name, domain } = roleCookieMap[user.role] || {
    name: "user_token",
    domain: ".myapp.com",
  };

  const cookieName = roleCookieMap[user.role] || 'user_token';
console.log({cookieName})
  res
    .status(statusCode)
    .cookie(name, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain
    })
    .json({
      success: true,
      message,
      user,
    });
};
