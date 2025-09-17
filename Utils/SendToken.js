export const sendToken = (res, user, message, statusCode = 200) => {
  const token = user.getJWTToken();

  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message,
      user,
    });
};
