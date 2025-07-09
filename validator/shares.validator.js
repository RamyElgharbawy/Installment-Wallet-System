const { check } = require("express-validator");
const validatorMiddleware = require("../middleware/validation.middleware");
const prisma = require("../config/prisma-db");

exports.createShareValidator = [
  check("amount")
    .notEmpty()
    .withMessage("share amount required")
    .isFloat({ gt: 0 })
    .withMessage("share amount must be negative number"),

  check("dueDate")
    .notEmpty()
    .withMessage("share dueDate required")
    .isISO8601()
    .toDate(),

  check("fellowId")
    .isUUID()
    .withMessage("invalid fellow id")
    .custom(async (val) => {
      const fellow = prisma.fellow.findUnique({ where: { id: val } });
      if (!fellow) {
        throw new Error(`There is no fellow for this id: ${val}`);
      }
      return true;
    }),

  check("itemId")
    .isUUID()
    .withMessage("invalid item id")
    .custom(async (val) => {
      const item = prisma.item.findUnique({ where: { id: val } });
      if (!item) {
        throw new Error(`There is no fellow for this id: ${val}`);
      }
      return true;
    }),

  validatorMiddleware,
];

exports.getShareValidator = [
  check("id")
    .isUUID()
    .withMessage("invalid share id")
    .custom(async (id) => {
      const share = prisma.share.findUnique({ where: { id } });
      if (!share) {
        throw new Error(`There is no share for this id: ${id}`);
      }
      return true;
    }),
  ,
  validatorMiddleware,
];
