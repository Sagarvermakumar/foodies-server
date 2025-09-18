export const sendToken = (res, user, message, statusCode = 200) => {
  const token = user.getJWTToken()
console.log("token : ", token)
  const isProduction = process.env.NODE_ENV === 'production'
  res
    .status(statusCode)
    .cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json({
      success: true,
      message,
      user,
    })
}
