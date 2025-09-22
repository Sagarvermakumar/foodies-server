
import { config } from "../config/env.js";
import { extractDomain } from "./extractDomain.js";


export const sendToken = (res, user, message, statusCode = 200) => {
  const token = user.getJWTToken();
  const isProduction = process.env.NODE_ENV === 'production';

  const roleCookieMap = {
    SUPER_ADMIN: { name: "super_admin_token", domain: extractDomain(config.ADMIN_URL) },
    MANAGER: { name: "manager_token", domain: extractDomain(config.ADMIN_URL) },
    STAFF: { name: "staff_token", domain: extractDomain(config.ADMIN_URL) },
    DELIVERY: { name: "delivery_token", domain: extractDomain(config.ADMIN_URL) },
    CUSTOMER: { name: "customer_token", domain: extractDomain(config.CLIENT_URL) },
  };

  const { name, domain } = roleCookieMap[user.role] || {
    name: "user_token",
    domain: ".myapp.com",
  };

  console.log({isProduction})

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  if (isProduction) cookieOptions.domain = domain; 
  if (isProduction) cookieOptions.path = "/"; 


  console.log({isProduction, cookieOptions, token})

  res
    .status(statusCode)
    .cookie(name, token, cookieOptions)
    .json({
      success: true,
      message,
      user,
    });
};
