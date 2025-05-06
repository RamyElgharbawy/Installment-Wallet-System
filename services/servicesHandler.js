const asyncHandler = require("express-async-handler");
const prisma = require("../config/prisma-db");
const ApiError = require("../utils/apiError");

// @desc    Create One Service
exports.createOne = (model) =>
  asyncHandler(async (req, res, next) => {
    // 1- check if user exist by email
    const existUser = await model.findUnique({
      where: { email: req.body.email },
    });

    if (existUser) {
      return next(new ApiError(`Email already exist`, 400));
    }

    // 2- create new user
    const user = await model.create({ data: req.body });

    if (!user) {
      return next(new ApiError(`failed to create user`, 500));
    }

    res.status(201).json({ data: user });
  });

// @desc    Get All Records service
exports.getAll = () =>
  asyncHandler(async (req, res, next) => {
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
