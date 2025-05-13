const asyncHandler = require("express-async-handler");
const prisma = require("../config/prisma-db");
const ApiError = require("../utils/apiError");
const bcrypt = require("bcrypt");

// @desc      Create User Service
// @route     POST /api/v1/users
// @access    Private/Admin-Moderator
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 12),
      role: req.body.role,
      salary: req.body.salary,
    },
  });

  if (!user) {
    return next(new ApiError(`failed to create user`, 500));
  }

  res.status(201).json({ data: user });
});
// @desc      Get All Users Service
// @route     GET /api/v1/users
// @access    Private/Admin-Moderator
exports.getAllUser = asyncHandler(async (req, res, next) => {
  // pagination options
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 10;
  const skip = (page - 1) * limit;
  const endIndex = page * limit;

  // get all user data
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  if (users.length < 1) {
    return next(new ApiError(`there is no users`, 404));
  }

  // get all user count
  const allUserCount = await prisma.user.count();

  // pagination result
  const pagination = {};

  pagination.totalItems = allUserCount || 0;
  pagination.currentPage = page;
  pagination.itemsPerPage = limit;
  pagination.totalPages = Math.ceil(allUserCount / limit);
  pagination.prevPage = skip > 0 ? page - 1 : null;
  pagination.nextPage = endIndex < allUserCount ? page + 1 : null;

  res.status(200).json({ pagination, data: users });
});

// @desc      Get Specific User Service
// @route     GET /api/v1/users/:id
// @access    Private/Admin-Moderator
exports.getUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  // 1- check if user exist
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return next(new ApiError(`there is no user for this id: ${userId}`, 404));
  }

  res.status(200).json({ data: user });
});

// @desc      Update Specific user Service
// @route     PUT /api/v1/users/:id
// @access    Private/Admin-Moderator
exports.updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      salary: req.body.salary,
    },
  });

  res.status(201).json({ data: updatedUser });
});

// @desc      Delete Specific user Service
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
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
  });

  res.status(204).send();
});

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
    message: "User password changed successfully",
    data: user,
  });
});
