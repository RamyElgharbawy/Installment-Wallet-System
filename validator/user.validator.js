const { check } = require("express-validator");
const validatorMiddleware = require("../middleware/validation.middleware");
const prisma = require("../config/prisma-db");

// @desc    create user validator
exports.createUserValidator = [
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (email) => {
      const user = await prisma.user.findUnique({ where: { email: email } });
      if (user) {
        return Promise.reject(
          new Error("This Email already registered please sign in")
        );
      }
      return true;
    }),

  check("password")
    .notEmpty()
    .withMessage("Password Required")
    .isLength({ min: 6 })
    .withMessage("Password minimum length 6 digits")
    .custom((pass, { req }) => {
      if (pass !== req.body.passwordConfirm) {
        throw new Error("Confirm Password incorrect");
      }
      return true;
    }),

  check("passwordConfirm").notEmpty().withMessage("confirm password required"),

  check("salary")
    .notEmpty()
    .withMessage("Salary Required")
    .isNumeric()
    .withMessage("salary must be a number"),

  validatorMiddleware,
];

// @desc get user validator
exports.getUserValidator = [
  check("id").isUUID().withMessage("Invalid User id"),
  validatorMiddleware,
];

// @desc delete user validator
exports.deleteUserValidator = [
  check("id").isUUID().withMessage("Invalid User id"),
  validatorMiddleware,
];

// @desc    update user validator
exports.updateUserValidator = [
  check("id").isUUID().withMessage("Invalid User id"),

  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (email) => {
      const user = await prisma.user.findUnique({ where: { email: email } });
      if (user) {
        return Promise.reject(
          new Error("This Email already registered please sign in")
        );
      }
      return true;
    }),

  check("salary")
    .notEmpty()
    .withMessage("Salary Required")
    .isNumeric()
    .withMessage("salary must be a number"),

  validatorMiddleware,
];

// @desc    Change user password validator
exports.changeUserPasswordValidator = [
  check("id").isUUID().withMessage("Invalid User id"),

  check("password")
    .notEmpty()
    .withMessage("Password Required")
    .isLength({ min: 6 })
    .withMessage("Password minimum length 6 digits")
    .custom((pass, { req }) => {
      if (pass !== req.body.passwordConfirm) {
        throw new Error("Confirm Password incorrect");
      }
      return true;
    }),

  check("passwordConfirm").notEmpty().withMessage("confirm password required"),

  validatorMiddleware,
];
