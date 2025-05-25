const servicesHandler = require("./servicesHandler");

// @desc    include owner param
const includeOwner = {
  owner: {
    select: {
      name: true,
    },
  },
};

// @desc      Create Spending Service
// @route     POST /api/v1/spendings
// @access    Public - Protected
exports.createSpending = servicesHandler.createOne("spending");

// @desc      Get All Spendings Service
// @route     GET /api/v1/spendings
// @access    Private - Protected [admin - moderator]

exports.getAllSpendings = servicesHandler.getAll("spending", {
  include: includeOwner,
});

// @desc      Get Specific Spending Service
// @route     GET /api/v1/spendings/:id
// @access    Public - Protected
exports.getSpending = servicesHandler.getOne("spending", {
  include: includeOwner,
});

// @desc      Update Specific Spending Service
// @route     PUT /api/v1/spendings/:id
// @access    Public - Protected
exports.updateSpending = servicesHandler.updateOne("spending", {
  allowedFields: ["name", "amount", "schedule", "startIn", "status"],
  include: includeOwner,
});

// @desc      Delete Specific Spending Service
// @route     DEL /api/v1/spendings/:id
// @access    Public - Protected
exports.deleteSpending = servicesHandler.deleteOne("spending");

// @desc      Get My Spendings Service
// @route     DEL /api/v1/spendings/mySpendings
// @access    Public - Protected
exports.getMySpendings = servicesHandler.getAll("spending", {
  include: includeOwner,
});
