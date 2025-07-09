const { check } = require("express-validator");
const validatorMiddleware = require("../middleware/validation.middleware");
const prisma = require("../config/prisma-db");

exports.createFellowValidator = [
  check("amount")
    .notEmpty()
    .withMessage("Fellow amount required")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isInt({ gt: 0 })
    .withMessage("Amount must be positive number")
    .isLength({ max: 10 })
    .withMessage("Too long Amount"),

  check("startIn")
    .notEmpty()
    .withMessage("StartIn date  required")
    .isISO8601()
    .toDate(),

  check("endIn")
    .notEmpty()
    .withMessage("EndIn date required")
    .isISO8601()
    .toDate(),

  check("numberOfMonths")
    .notEmpty()
    .withMessage("Number of months required")
    .isNumeric()
    .withMessage("Number of months must be a number")
    .isInt({ gt: 0 })
    .withMessage("Number of months must be positive number"),

  check("turnMonth")
    .notEmpty()
    .withMessage("Turn month required")
    .isNumeric()
    .withMessage("Turn month must be a number")
    .isLength({ max: 3 })
    .withMessage("Too long number"),

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

exports.updateFellowValidator = [
  check("id")
    .isUUID()
    .withMessage("Invalid Item id")
    .custom(async (val, { req }) => {
      // check fellow exist & belong to current user
      const fellow = await prisma.fellow.findUnique({
        where: { id: val },
      });

      if (!fellow) {
        throw new Error(`There is no fellow for this id`);
      } else if (fellow.userId !== req.user.id) {
        // check fellow owner
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

  check("endIn").optional().isISO8601().toDate(),

  check("numberOfMonths")
    .optional()
    .isNumeric()
    .withMessage("Number of months must be a number")
    .isInt({ gt: 0 })
    .withMessage("Number of months must be positive number"),

  check("turnMonth")
    .optional()
    .isNumeric()
    .withMessage("Turn month must be a number")
    .isLength({ max: 3 })
    .withMessage("Too long number"),

  validatorMiddleware,
];

// @desc    get fellow validator
exports.getFellowValidator = [
  check("id")
    .isUUID()
    .withMessage("Invalid fellow id")
    .custom(async (val, { req }) => {
      // check fellow exist & belong to current user
      const fellow = await prisma.fellow.findUnique({
        where: { id: val },
      });

      if (!fellow) {
        throw new Error(`There is no fellow for this id`);
      } else if (fellow.userId !== req.user.id) {
        // check fellow owner
        throw new Error(`this fellow not belong to this user`);
      }
      return true;
    }),
  validatorMiddleware,
];

// @desc    delete fellow validator
exports.deleteFellowValidator = [
  check("id")
    .isUUID()
    .withMessage("Invalid Item id")
    .custom(async (val) => {
      const fellow = await prisma.fellow.findUnique({ where: { id: val } });
      if (!fellow) {
        throw new Error(`There is no fellow for this id`);
      }
      return true;
    }),
  validatorMiddleware,
];

// @desc    Get my fellows validator
exports.getMyFellowsValidator = [
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
