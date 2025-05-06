const asyncHandler = require("express-async-handler");
const prisma = require("../config/prisma-db");
const ApiError = require("../utils/apiError");

// @desc      Create User Service
// @route     POST /api/v1/users
// @access    Private
exports.createUser = asyncHandler(async (req, res, next) => {
  // 1- check if user exist by email
  const existUser = await prisma.user.findUnique({
    where: { email: req.body.email },
  });

  if (existUser) {
    return next(new ApiError(`Email already exist`, 400));
  }

  // 2- create new user
  const user = await prisma.user.create({ data: req.body });

  if (!user) {
    return next(new ApiError(`failed to create user`, 500));
  }

  res.status(201).json({ data: user });
});
// @desc      Get All Users Service
// @route     GET /api/v1/users
// @access    Private
exports.getAllUser = asyncHandler(async (req, res, next) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!users) {
    return next(new ApiError(`there is no users`, 404));
  }

  res.status(201).json({ results: users.length, data: users });
});

// @desc      Get Specific User Service
// @route     GET /api/v1/users/:id
// @access    Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  // 1- check if user exist
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return next(new ApiError(`there is no user for this id: ${userId}`, 404));
  }

  res.status(201).json({ data: user });
});

// @desc      Update Specific user Service
// @route     PUT /api/v1/users/:id
// @access    Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  // 1- check if user exist
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return next(new ApiError(`there is no user for this id: ${userId}`, 404));
  }

  // 2- update user data
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: req.body,
    select: { id: true, name: true, email: true, updatedAt: true },
  });

  res.status(201).json({ data: updatedUser });
});

// @desc      Delete Specific user Service
// @route     PUT /api/v1/users/:id
// @access    Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  // 1- check if user exist
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return next(new ApiError(`there is no user for this id: ${userId}`, 404));
  }

  // 2- update user data
  const deletedUser = await prisma.user.delete({
    where: { id: userId },
    select: { id: true, name: true, email: true, updatedAt: true },
  });

  res.status(204).send();
});
