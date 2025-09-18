class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server error";
  // Handle Mongo Validation Error
  if (err.name === "ValidationError") {
    err.message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    err.statusCode = 400;
  }

  // Handle Duplicate Key Error
if (err.code === 11000) {
  const duplicatedField = err?.keyValue ? Object.keys(err.keyValue)[0] : "unknown";
  const message = `Duplicate field value entered: ${duplicatedField}`;
  err = new ErrorHandler(message, 400);
}


  // Handle CastError (like invalid MongoDB ObjectId)
  if (err.name === "CastError") {
    err.message = `Invalid ${err.path}: ${err.value}`;
    err.statusCode = 400;
  }

  if (typeof err === "string") {
    err.message = `Venom Logged Error ${err}`;
    err.statusCode =500;
  }

  // Handle Timeout or Connection Error
  if (
    err.message?.includes("timed out") ||
    err.message?.includes("ECONNREFUSED") ||
    err.message?.includes("ENOTFOUND") ||
    err.message?.includes("ETIMEDOUT") ||
    err.message?.includes("ECONNRESET") ||
    err.message?.includes("EAI_AGAIN") ||
    err.message?.includes("Network Error") ||
    err.message?.includes("Server Error") ||
    err.message?.includes("Service Unavailable") ||
    err.message?.includes("Connection Error") ||
    err.message?.includes("Connection Refused") ||
    err.message?.includes("Connection Reset") ||
    err.message?.includes("Network Timeout") ||
    err.message?.includes("Network Unreachable") 

  ) {
    err.message = "Server is currently unavailable. Please try again later.";
    err.statusCode = 503;
  }

  // Handle JWT Error
  if (err.name === "JsonWebTokenError") {
    err.message = "Invalid token. Please log in again.";
    err.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    err.message = "Session expired. Please log in again.";
    err.statusCode = 401;
  }

  if (err.message)
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
};

export default ErrorHandler;
