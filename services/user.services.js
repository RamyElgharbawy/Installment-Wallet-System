const asyncHandler = require("express-async-handler");
const prisma = require("../config/prisma-db");
const ApiError = require("../utils/apiError");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

// @desc      Create User Service
// @route     POST /api/v1/users
// @access    Private/Admin-Moderator
exports.createUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 12),
        role: req.body.role,
        salary: req.body.salary,
      },
    });

    res.status(201).json({ data: user });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 500));
  }
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
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    res.status(200).json({ data: user });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 404));
  }
});

// @desc      Update Specific user Service
// @route     PUT /api/v1/users/:id
// @access    Private/Admin-Moderator
exports.updateUser = asyncHandler(async (req, res, next) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        salary: req.body.salary,
      },
    });

    res.status(201).json({ data: updatedUser });
  } catch (error) {
    console.error(error);
    return next(new ApiError(error, 404));
  }
});

// @desc      Delete Specific user Service
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  try {
    const deletedUser = await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(`there is no user for this id: ${userId}`, error, 404)
    );
  }
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
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },

      data: {
        name: req.body.name,
        email: req.body.email,
        salary: req.body.salary,
      },
    });

    res.status(201).json({ data: updatedUser });
  } catch (error) {
    return next(new ApiError(error, 404));
  }
});

// @desc      Get Logged User Data Middleware
// @route     GET /api/v1/users/profile
// @access    Public/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  // get user id from user object in logged user response and inject it into params
  req.params.id = req.user.id;
  next();
});
