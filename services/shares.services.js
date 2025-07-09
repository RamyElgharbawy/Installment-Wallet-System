const asyncHandler = require("express-async-handler");
const servicesHandler = require("./servicesHandler");
const prisma = require("../config/prisma-db");
const ApiError = require("../utils/apiError");

// @desc      Create Share Service
// @route     POST /api/v1/shares
// @access    Public - Protected
exports.createShare = servicesHandler.createOne("share");

// @desc      Get All shares Service
// @route     GET /api/v1/shares
// @route     GET /api/v1/fellow/:id/shares
// @route     GET /api/v1/items/:id/shares
// @access    Private - Protected [admin - moderator]
exports.getAllShares = servicesHandler.getAll("share");

// @desc      Get Specific Share Service
// @route     GET /api/v1/shares/:id
// @access    Public - Protected
exports.getShare = servicesHandler.getOne("share");

// @desc      Update Specific Share Paid Status Service
// @route     PUT /api/v1/shares/:id
// @access    Public - Protected
exports.updateShareToPaid = asyncHandler(async (req, res, next) => {
  const share = await prisma.share.update({
    where: { id: req.params.id },
    data: {
      payStatus: true,
      payDate: new Date(Date.now()),
    },
  });

  if (!share) {
    return next(
      new ApiError(`There is now share for this id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ data: share });
});

// @desc      Update Specific Share Paid Status Service
// @route     PUT /api/v1/shares/:id
// @access    Public - Protected
exports.updateShareToUnPaid = asyncHandler(async (req, res, next) => {
  const share = await prisma.share.update({
    where: { id: req.params.id },
    data: {
      payStatus: false,
      payDate: new Date(Date.now()),
    },
  });

  if (!share) {
    return next(
      new ApiError(`There is now share for this id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ data: share });
});

// @desc      Delete Specific Share Service
// @route     DEL /api/v1/shares/:id
// @access    Public - Protected
exports.deleteShare = servicesHandler.deleteOne("share");
