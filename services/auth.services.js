const asyncHandler = require("express-async-handler");
const prisma = require("../config/prisma-db");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

// @desc      Signup Service
// @route     POST /api/v1/auth/signup
// @access    Public
exports.signup = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 12),
      salary: req.body.salary,
    },
  });

  if (!user) {
    return next(new ApiError(`failed to signup`, 500));
  }

  // generate token
  const token = generateToken(user.id);

  res.status(201).json({ data: user, token });
});

// @desc      login Service
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1- find user by email
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      salary: true,
      netSalary: true,
      updatedAt: true,
    },
  });

  // 2- check email & password
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Email or Password Incorrect", 401));
  }

  // generate token
  const token = generateToken(user.id);

  res.status(200).json({ data: user, token });
});

// @desc  Protect middleware to authenticate routes
exports.protect = asyncHandler(async (req, res, next) => {
  //   1- check if token in request headers.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ApiError("Please login to access this recourse", 401));
  }

  //  2- verify token (not expired, no changes happen after token created).

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  //  3- check if user exist.
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });
  if (!currentUser) {
    return next(new ApiError("This user doesn`t exist", 401));
  }

  //  4- check if user changes his password after token created.
  if (currentUser.passwordChangedAt > decoded.iat) {
    return next(
      new ApiError(
        "User has recently changed password, please login again",
        401
      )
    );
  }

  //  5- Inject user to request object to use it in allowedTo middleware.
  req.user = currentUser;
  next();
});

// @desc  allowedTo Middleware [Authorization]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // check logged user role is included in roles array.
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(`You are not allowed to access this recourse`, 403)
      );
    }

    next();
  });
