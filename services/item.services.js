const asyncHandler = require("express-async-handler");
const prisma = require("../config/prisma-db");
const ApiError = require("../utils/apiError");

const servicesHandler = require("./servicesHandler");

// @desc    include owner param
const includeOwner = {
  owner: {
    select: {
      name: true,
    },
  },
};

// @desc      Create Item Service
// @route     POST /api/v1/items
// @access    Public - Protected
exports.createItem = servicesHandler.createOne("item");

// @desc      Get All items Service
// @route     GET /api/v1/items
// @access    Private - Protected [admin - moderator]

exports.getAllItems = servicesHandler.getAll("item", { include: includeOwner });

// @desc      Get Specific Item Service
// @route     GET /api/v1/items/:id
// @access    Public - Protected
exports.getItem = servicesHandler.getOne("item", { include: includeOwner });

// @desc      Update Specific Item Service
// @route     PUT /api/v1/items/:id
// @access    Public - Protected
exports.updateItem = servicesHandler.updateOne("item", {
  allowedFields: [
    "type",
    "title",
    "price",
    "purchaseDate",
    "numberOfMonths",
    "monthlyAmount",
    "startIn",
    "endIn",
    "status",
    "notes",
  ],
  include: includeOwner,
});

// @desc      Delete Specific Item Service
// @route     DEL /api/v1/items/:id
// @access    Public - Protected
exports.deleteItem = servicesHandler.deleteOne("item");
