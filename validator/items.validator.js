const { check } = require("express-validator");
const validatorMiddleware = require("../middleware/validation.middleware");
const prisma = require("../config/prisma-db");

exports.createItemValidator = [
  check("type")
    .notEmpty()
    .withMessage("Item type required")
    .isIn(["purchaseItem", "loan"]),

  check("title").notEmpty().withMessage("Item title required"),

  check("price")
    .notEmpty()
    .withMessage("Item Price required")
    .isNumeric()
    .withMessage("Price must be a number")
    .isInt({ gt: 0 })
    .withMessage("price must be positive number")
    .isLength({ max: 10 })
    .withMessage("Too long price"),

  check("purchaseDate")
    .notEmpty()
    .withMessage("Purchase date required")
    .isISO8601()
    .toDate(),

  check("numberOfMonths")
    .notEmpty()
    .withMessage("Number of months required")
    .isNumeric()
    .withMessage("Number of months must be a number")
    .isInt({ gt: 0 })
    .withMessage("Number of months must be positive number"),

  check("monthlyAmount").optional(),
  check("startIn")
    .notEmpty()
    .withMessage("StartIn date  required")
    .isISO8601()
    .toDate(),

  check("endIn")
    .notEmpty()
    .withMessage("StartIn date required")
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

exports.updateItemValidator = [
  check("id")
    .isUUID()
    .withMessage("Invalid Item id")
    .custom(async (val, { req }) => {
      // check item exist & belong to current user
      const item = await prisma.item.findUnique({
        where: { id: val },
      });

      if (!item) {
        throw new Error(`There is no item for this id`);
      } else if (item.userId !== req.user.id) {
        // check item owner
        throw new Error(`You are not allowed to perform this action`);
      }

      // set required fields to body for update query
      if (!req.body.numberOfMonths)
        req.body.numberOfMonths = item.numberOfMonths;
      if (!req.body.price) req.body.price = item.price;

      return true;
    }),

  check("price")
    .notEmpty()
    .withMessage("Item Price required")
    .isNumeric()
    .withMessage("Price must be a number")
    .isLength({ max: 10 })
    .withMessage("Too long price")
    .isInt({ gt: 0 })
    .withMessage("price must be positive number"),

  check("purchaseDate").optional().isISO8601().toDate(),

  check("numberOfMonths")
    .notEmpty()
    .withMessage("Number of months required")
    .isNumeric()
    .withMessage("Number of months must be a number")
    .isInt({ gt: 0 })
    .withMessage("Number of months must be positive number"),

  check("startIn").optional().isISO8601().toDate(),

  check("endIn").optional().isISO8601().toDate(),

  validatorMiddleware,
];

// @desc    get item validator
exports.getItemValidator = [
  check("id")
    .isUUID()
    .withMessage("Invalid Item id")
    .custom(async (val, { req }) => {
      // check item exist & belong to current user
      const item = await prisma.item.findUnique({
        where: { id: val },
      });

      if (!item) {
        throw new Error(`There is no item for this id`);
      } else if (item.userId !== req.user.id) {
        // check item owner
        throw new Error(`this fellow not belong to this user`);
      }
      return true;
    }),
  validatorMiddleware,
];

// @desc    delete item validator
exports.deleteItemValidator = [
  check("id")
    .isUUID()
    .withMessage("Invalid Item id")
    .custom(async (val) => {
      const item = await prisma.item.findUnique({ where: { id: val } });
      if (!item) {
        throw new Error(`There is no item for this id`);
      }
      return true;
    }),
  validatorMiddleware,
];

// @desc    Get my items validator
exports.getMyItemsValidator = [
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
