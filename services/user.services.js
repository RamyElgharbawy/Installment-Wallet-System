const asyncHandler = require("express-async-handler");
const prisma = require("../config/prisma-db");
const ApiError = require("../utils/apiError");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const servicesHandler = require("./servicesHandler");

// @desc  includes params
const includeOptions = {
  items: {
    select: {
      type: true,
      status: true,
      monthlyAmount: true,
    },
  },
  fellows: {
    select: {
      amount: true,
      turnMonth: true,
    },
  },
  spending: {
    select: {
      name: true,
      amount: true,
      schedule: true,
    },
  },
};

// @desc      Create User Service
// @route     POST /api/v1/users
// @access    Private/Admin-Moderator
exports.createUser = servicesHandler.createOne("user");

// @desc      Get All Users Service
// @route     GET /api/v1/users
// @access    Private/Admin-Moderator
exports.getAllUser = servicesHandler.getAll("user", {
  include: includeOptions,
});

// @desc      Get Specific User Service
// @route     GET /api/v1/users/:id
// @access    Private/Admin-Moderator
exports.getUser = servicesHandler.getOne("user", {
  include: includeOptions,
});

// @desc      Update Specific user Service
// @route     PUT /api/v1/users/:id
// @access    Private/Admin-Moderator
exports.updateUser = servicesHandler.updateOne("user", {
  allowedFields: ["name", "email", "role", "salary"],
  include: includeOptions,
});

// @desc      Delete Specific user Service
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
exports.deleteUser = servicesHandler.deleteOne("user");

// @desc      Change User Password Service
// @route     PUT /api/v1/user/changePassword/:id
// @access    Private/Admin-Moderator
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: parseInt(Date.now() / 1000, 10),
    },
    select: {
      id: true,
      name: true,
      email: true,
      updatedAt: true,
    },
  });

  res.status(201).json({
    status: "Success",
    message: `User [${user.name}], his password changed successfully`,
  });
});

// @desc      Change Logged User Password
// @route     PUT /api/v1/users/changeMyPassword
// @access    Public/Protect
exports.changeLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1- get logged user from req
  const user = await prisma.user.update({
    where: { id: req.user.id },
    select: {
      id: true,
      password: true,
      passwordChangedAt: true,
    },
    data: {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: parseInt(Date.now() / 1000, 10),
    },
  });

  if (!user) {
    return next(new ApiError(`No User For This id:${req.user.id}`, 404));
  }

  const token = generateToken(user.id);

  res
    .status(200)
    .json({ message: "Your Password changed successfully", token });
});

// @desc      Update Logged User Data
// @route     PUT /api/v1/users/updateMyData
// @access    Public/Protect
exports.updateLoggedUserData = servicesHandler.updateOne("user", {
  allowedFields: ["name", "salary", "email"],
  include: includeOptions,
});

// @desc      Get Logged User Data Middleware
// @route     GET /api/v1/users/profile
// @access    Public/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  // get user id from user object in logged user response and inject it into params
  req.params.id = req.user.id;
  next();
});
