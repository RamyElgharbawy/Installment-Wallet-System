const ApiError = require("../utils/apiError");

// @desc    global error handling middleware
const globalErrorHandling = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.message === "invalid signature") err = handleJwtInvalidSignature();
    if (err.message === "jwt malformed") err = handleJwtMalformedToken();
    if (err.message === "jwt expired") err = handleJwtExpiredToken();

    sendErrorForProd(err, res);
  }
};

// @desc    error schema for development mode
const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// @desc    error schema for production
const sendErrorForProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

// handle jwt invalid signature error method
const handleJwtInvalidSignature = () =>
  new ApiError(`Invalid token , please login again`, 401);

// handle jwt expired token error method
const handleJwtExpiredToken = () =>
  new ApiError(`Expired token , please login again`, 401);

// handle jwt malformed token error method
const handleJwtMalformedToken = () =>
  new ApiError(`Incorrect token , Fuck you [^@^]`, 401);

module.exports = globalErrorHandling;
