import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
export const sendToken = (res, user, message, statusCode = 200) => {
  const token = user.getJWTToken()
  const isProduction = config.NODE_ENV === 'production'
  const roleCookieMap = {
    SUPER_ADMIN: 'super_admin_token',
    MANAGER: 'manager_token',
    STAFF: 'staff_token',
    DELIVERY: 'delivery_token',
    CUSTOMER: 'customer_token',
  }

  const decoded = jwt.verify(token, config.JWT_SECRET)
  const tokenName = roleCookieMap[decoded.role]
  console.log({ token, tokenName, decoded })
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax', // cross-site
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }

  // Role-specific token
  res.cookie(tokenName, token, cookieOptions)

  // last_active_role cookie
  res.cookie('last_active_role', decoded.role, {
    ...cookieOptions,
    httpOnly: false, // client can read for UI / query param
  })

  // send response
  res.status(statusCode).json({
    success: true,
    message,
    user,
  })
}
