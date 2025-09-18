export const sendToken = (res, user, message, statusCode = 200) => {
  const token = user.getJWTToken();
  const isProduction = process.env.NODE_ENV === 'production';

  // Role-based cookie name
  const roleCookieMap = {
    SUPER_ADMIN: 'super_admin_token',
    MANAGER: 'manager_token',
    STAFF: 'staff_token',
    DELIVERY: 'delivery_token',
    CUSTOMER: 'customer_token',
  };

  const cookieName = roleCookieMap[user.role] || 'user_token';

  res
    .status(statusCode)
    .cookie(cookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json({
      success: true,
      message,
      user,
    });
};
