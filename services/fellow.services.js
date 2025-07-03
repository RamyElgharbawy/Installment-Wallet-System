const servicesHandler = require("./servicesHandler");

// @desc    include owner param
const includeOwner = {
  owner: {
    select: {
      name: true,
    },
  },
  shares: {
    select: {
      amount: true,
      dueDate: true,
      payStatus: true,
    },
  },
};

// @desc      Create Fellow Service
// @route     POST /api/v1/fellows
// @access    Public - Protected
exports.createFellow = servicesHandler.createOne("fellow");

// @desc      Get All Fellows Service
// @route     GET /api/v1/fellows
// @access    Private - Protected [admin - moderator]

exports.getAllFellows = servicesHandler.getAll("fellow", {
  include: includeOwner,
});

// @desc      Get Specific Fellow Service
// @route     GET /api/v1/fellows/:id
// @access    Public - Protected
exports.getFellow = servicesHandler.getOne("fellow", { include: includeOwner });

// @desc      Update Specific Fellow Service
// @route     PUT /api/v1/fellows/:id
// @access    Public - Protected
exports.updateFellow = servicesHandler.updateOne("fellow", {
  allowedFields: [
    "manager",
    "amount",
    "startIn",
    "endIn",
    "numberOfMonths",
    "turnMonth",
    "status",
  ],
  include: includeOwner,
});

// @desc      Delete Specific Fellow Service
// @route     DEL /api/v1/fellows/:id
// @access    Public - Protected
exports.deleteFellow = servicesHandler.deleteOne("fellow");
