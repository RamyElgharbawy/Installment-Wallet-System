const { check } = require("express-validator");
const validatorMiddleware = require("../middleware/validation.middleware");
const prisma = require("../config/prisma-db");

exports.setPercentageValidator = [
  check("bankName").notEmpty().withMessage("Bank name required").toLowerCase(),

  check("period")
    .notEmpty()
    .withMessage("installment period required")
    .isNumeric()
    .withMessage("period must be a number")
    .isIn([3, 6, 9, 10, 12, 18, 24, 36])
    .withMessage("period must be in this range [3, 6, 9, 10, 12, 18, 24, 36]")
    .custom(async (val, { req }) => {
      const period = await prisma.installmentFees.findFirst({
        where: { period: val, bankName: req.body.bankName },
      });

      if (period) {
        throw new Error("Period exist, can`t create same period");
      }
      return true;
    }),

  check("purchasingPercentage")
    .notEmpty()
    .withMessage("Purchasing percentage required")
    .isNumeric()
    .withMessage("purchasing percentage must be a number")
    .isFloat({ gt: 0 })
    .withMessage("purchasing percentage must be positive number"),

  check("cashPercentage")
    .notEmpty()
    .withMessage("Cash percentage required")
    .isNumeric()
    .withMessage("Cash percentage must be a number")
    .isFloat({ gt: 0 })
    .withMessage("Cash percentage must be positive number"),

  validatorMiddleware,
];

exports.updatePercentageValidator = [
  check("id")
    .isUUID()
    .withMessage("Invalid percentage id")
    .custom(async (id) => {
      const percent = await prisma.installmentFees.findUnique({
        where: { id },
      });
      if (!percent) {
        throw new Error("There is not percentage for this id");
      }
      return true;
    }),

  check("bankName").optional().toLowerCase(),

  check("period")
    .optional()
    .isNumeric()
    .withMessage("period must be a number")
    .isIn([3, 6, 9, 10, 12, 18, 24, 36])
    .withMessage("period must be in this range [3, 6, 9, 10, 12, 18, 24, 36]")
    .custom(async (val, { req }) => {
      const period = await prisma.installmentFees.findFirst({
        where: { period: val, bankName: req.body.bankName },
      });

      if (period) {
        throw new Error("Period exist, can`t create same period");
      }
      return true;
    }),

  check("purchasingPercentage")
    .optional()
    .isNumeric()
    .withMessage("purchasing percentage must be a number")
    .isFloat({ gt: 0 })
    .withMessage("purchasing percentage must be positive number"),

  check("cashPercentage")
    .optional()
    .isNumeric()
    .withMessage("Cash percentage must be a number")
    .isFloat({ gt: 0 })
    .withMessage("Cash percentage must be positive number"),

  validatorMiddleware,
];

// @desc    get percentage validator
exports.getPercentageValidator = [
  check("id").isUUID().withMessage("Invalid percentage id"),
  validatorMiddleware,
];

// @desc    delete percentage validator
exports.deletePercentageValidator = [
  check("id")
    .isUUID()
    .withMessage("Invalid percentage id")
    .custom(async (id) => {
      const percent = await prisma.installmentFees.findUnique({
        where: { id },
      });
      if (!percent) {
        throw new Error("There is not percentage for this id");
      }
      return true;
    }),
  validatorMiddleware,
];

// @desc  bank Installment Fees Calculation validator
exports.bankInstFeesCalculationValidator = [
  check("bankName").notEmpty().withMessage("Bank name required").toLowerCase(),

  check("period")
    .notEmpty()
    .withMessage("installment period required")
    .isNumeric()
    .withMessage("period must be a number")
    .isIn([3, 6, 9, 10, 12, 18, 24, 36])
    .withMessage("period must be in this range [3, 6, 9, 10, 12, 18, 24, 36]")
    .custom(async (val, { req }) => {
      const period = await prisma.installmentFees.findFirst({
        where: { period: val, bankName: req.body.bankName },
      });

      if (!period) {
        throw new Error(
          "There is no installment plans for this bank on this period"
        );
      }
      return true;
    }),

  check("amount")
    .notEmpty()
    .withMessage("amount required")
    .isNumeric()
    .withMessage("amount must be a number")
    .isFloat({ gt: 0 })
    .withMessage("amount must be positive number"),

  check("type")
    .notEmpty()
    .withMessage("installment type required")
    .isIn(["cash", "purchasing"])
    .withMessage("type must be in [cash, purchasing]"),

  validatorMiddleware,
];
