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

exports.getAllItems = servicesHandler.getAll("item", includeOwner);

// @desc      Get Specific Item Service
// @route     GET /api/v1/items/:id
// @access    Public - Protected
exports.getItem = servicesHandler.getOne("item", includeOwner);

// @desc      Update Specific Item Service
// @route     PUT /api/v1/items/:id
// @access    Public - Protected
exports.updateItem = servicesHandler.updateOne("item", includeOwner);

// @desc      Delete Specific Item Service
// @route     DEL /api/v1/items/:id
// @access    Public - Protected
exports.deleteItem = servicesHandler.deleteOne("item");

// @desc      Get My Items Service
// @route     DEL /api/v1/items/myItems
// @access    Public - Protected
exports.getMyItems = asyncHandler(async (req, res, next) => {
  // pagination options
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 10;
  const skip = (page - 1) * limit;
  const endIndex = page * limit;

  // get all record data
  const items = await prisma.item.findMany({
    where: { userId: req.user.id },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: {
          name: true,
        },
      },
    },
  });

  if (items.length < 1) {
    return next(new ApiError(`There is no items found`, 404));
  }

  // pagination result
  const pagination = {};

  pagination.totalItems = items.length || 0;
  pagination.currentPage = page;
  pagination.itemsPerPage = limit;
  pagination.totalPages = Math.ceil(items.length / limit);
  pagination.prevPage = skip > 0 ? page - 1 : null;
  pagination.nextPage = endIndex < items.length ? page + 1 : null;

  res.status(200).json({ pagination, data: items });
});
