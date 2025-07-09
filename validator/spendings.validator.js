const { check } = require("express-validator");
const validatorMiddleware = require("../middleware/validation.middleware");
const prisma = require("../config/prisma-db");

exports.createSpendingValidator = [
  check("name").notEmpty().withMessage("Spending name required"),

  check("amount")
    .notEmpty()
    .withMessage("Spending amount required")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isInt({ gt: 0 })
    .withMessage("Amount must be positive number")
    .isLength({ max: 10 })
    .withMessage("Too long Amount"),

  check("schedule")
    .notEmpty()
    .withMessage("Schedule payment cycle required")
    .isIn(["daily", "weekly", "monthly", "annually"]),

  check("startIn")
    .notEmpty()
    .withMessage("StartIn date  required")
    .isISO8601()
    .toDate(),

  check("userId")
    .notEmpty()
    .withMessage("userId required")
    .isUUID()
    .withMessage("Invalid user id")
    .custom(async (id) => {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new Error("There is no user for this id");
      }
      return true;
    }),

  validatorMiddleware,
];

exports.updateSpendingValidator = [
  check("id")
    .isUUID()
    .withMessage("Invalid Item id")
    .custom(async (val, { req }) => {
      // check spending exist & belong to current user
      const spending = await prisma.spending.findUnique({
        where: { id: val },
      });

      if (!spending) {
        throw new Error(`There is no spending for this id`);
      } else if (spending.userId !== req.user.id) {
        // check spending owner
        throw new Error(`You are not allowed to perform this action`);
      }

      return true;
    }),

  check("amount")
    .optional()
    .isNumeric()
    .withMessage("Amount must be a number")
    .isInt({ gt: 0 })
    .withMessage("Amount must be positive number")
    .isLength({ max: 10 })
    .withMessage("Too long Amount"),

  check("startIn").optional().isISO8601().toDate(),

  validatorMiddleware,
];

// @desc    get spending validator
exports.getSpendingValidator = [
  check("id")
    .isUUID()
    .withMessage("Invalid spending id")
    .custom(async (val, { req }) => {
      // check spending exist & belong to current user
      const spending = await prisma.spending.findUnique({
        where: { id: val },
      });

      if (!spending) {
        throw new Error(`There is no spending for this id`);
      } else if (spending.userId !== req.user.id) {
        // check spending owner
        throw new Error(`You are not allowed to perform this action`);
      }
      return true;
    }),
  validatorMiddleware,
];

// @desc    delete spending validator
exports.deleteSpendingValidator = [
  check("id")
    .isUUID()
    .withMessage("Invalid Item id")
    .custom(async (val) => {
      const spending = await prisma.spending.findUnique({ where: { id: val } });
      if (!spending) {
        throw new Error(`There is no spending for this id`);
      }
      return true;
    }),
  validatorMiddleware,
];

// @desc    Get my spendings validator
exports.getMySpendingsValidator = [
  check("userId")
    .isUUID()
    .withMessage("Invalid user id")
    .custom(async (id) => {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new Error(`There is no user for this id`);
      }
      return true;
    }),
  validatorMiddleware,
];
