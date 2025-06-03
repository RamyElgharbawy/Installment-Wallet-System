const asyncHandler = require("express-async-handler");
const prisma = require("../config/prisma-db");
const ApiError = require("../utils/apiError");
const serviceHandler = require("./servicesHandler");

// @desc      Set Percentage Service
// @route     POST /api/v1/installmentFees
// @access    Private[admin-moderator]
exports.setPercentage = serviceHandler.createOne("installmentFees");

// @desc      Get Specific Percentage Service
// @route     GET /api/v1/installmentFees/:id
// @access    Private[admin-moderator]
exports.getPercentage = serviceHandler.getOne("installmentFees", {
  include: {},
});

// @desc      Get All Percentage Service
// @route     GET /api/v1/installmentFees
// @access    Private[admin-moderator]
exports.getAllPercentage = serviceHandler.getAll("installmentFees", {
  where: {},
});

// @desc      Update Specific Percentage Service
// @route     PUT /api/v1/installmentFees/:id
// @access    Private[admin-moderator]
exports.updatePercentage = serviceHandler.updateOne("installmentFees", {
  allowedFields: [
    "bankName",
    "period",
    "purchasingPercentage",
    "cashPercentage",
  ],
});

// @desc      Delete Specific Percentage Service
// @route     DELETE /api/v1/installmentFees/:id
// @access    Private[admin-moderator]
exports.deletePercentage = serviceHandler.deleteOne("installmentFees");

// @desc      Bank installment fees calculator
// @route     Post /api/v1/installmentFees
// @access    Public[protected]
exports.bankInstFeesCalculation = asyncHandler(async (req, res, next) => {
  // get inputs
  const amount = +req.body.amount;
  const period = req.body.period;
  const bankName = req.body.bankName.toLowerCase();
  const type = req.body.type;
  // get percent depend on user inputs
  const percent = await prisma.installmentFees.findFirst({
    where: { period, bankName },
  });

  if (!percent) {
    return next(
      new ApiError(
        `There is no installment plans for this bank on this period`,
        404
      )
    );
  }
  // calculate fees
  let fees;
  if (type === "purchasing") {
    fees = parseFloat(
      ((amount * percent.purchasingPercentage) / 100).toFixed(2)
    );
  } else if (type === "cash") {
    fees = parseFloat(((amount * percent.cashPercentage) / 100).toFixed(2));
  }

  res.status(200).json({
    status: "Success",
    result: fees,
    Bank: bankName,
    Percentage:
      type === "cash" ? percent.cashPercentage : percent.purchasingPercentage,
  });
});
