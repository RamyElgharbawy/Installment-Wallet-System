const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const prisma = require("../config/prisma-db");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");

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

// @desc      Forgot Password Service
// @route     POST /api/v1/auth/forgotPassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1- get user by email
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });
  if (!user) {
    return next(new ApiError(`There is no user for this email`, 404));
  }

  //    2- Generate reset code [random 6 digits] & save it in db.
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  //     -> after generate code hashed it with crypto.
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  //     -> create expire time to reset code in db.
  const expire_time = Date.now() + 10 * 60 * 1000; // 10 min

  //     -> save hashed code in db.
  try {
    await prisma.verificationCode.upsert({
      where: { email: req.body.email },
      // update record if exist
      update: {
        code: hashedResetCode,
        expiresAt: new Date(expire_time),
      },
      // create new record if not found
      create: {
        email: req.body.email,
        code: hashedResetCode,
        expiresAt: new Date(expire_time),
      },
    });
  } catch (error) {
    console.error(error);
    return next(new ApiError("Can not create code", 500));
  }

  //  3- send reset code via email.
  const massage = `Hi ${user.name}\n
        We Received Request to reset your account password\n
        Enter the following code to reset your password.\n
        ${resetCode}\n
        Thanks to helping us to keep your account secure.\n
        Installment Wallet Team`;

  try {
    await sendMail({
      email: user.email,
      subject: "Your Password Reset Code (Valid for 10 min)",
      massage,
    });
  } catch (error) {
    console.error(error);
    return next(new ApiError("There is an Error in sending mail", 500));
  }

  res
    .status(200)
    .json({ status: "Success", massage: "Reset code sent to your email" });
});

// @desc      Verify reset code
// @route     POST /api/v1/auth/verifyResetCode
// @access    Public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  // hash incoming reset code from body
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  // update verification code status in db if valid and not expired
  try {
    await prisma.verificationCode.update({
      where: {
        code: hashedResetCode,
        expiresAt: { gt: new Date(Date.now()) },
      },
      data: { verified: true },
    });

    res.status(200).json({ status: "Success" });
  } catch (error) {
    console.error(error);
    return next(new ApiError(`Invalid or expired code`, 500));
  }
});

// @desc      Reset Password
// @route     POST /api/v1/auth/resetPassword
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  try {
    const user = await prisma.$transaction([
      // find user by email And update password
      prisma.user.update({
        where: {
          email: req.body.email,
        },
        data: {
          password: await bcrypt.hash(req.body.password, 12),
          passwordChangedAt: parseInt(Date.now() / 1000, 10),
        },
      }),

      // delete verification code from db
      prisma.verificationCode.deleteMany({
        where: {
          email: req.body.email,
        },
      }),
    ]);

    //  generate new token to user.
    const token = generateToken(user[0].id);

    res
      .status(200)
      .json({
        status: "Success",
        massage: "Your password changed successfully",
        token,
      });
  } catch (error) {
    console.error(error);
    return next(new ApiError(`Please verify your reset code`, 500));
  }
});
