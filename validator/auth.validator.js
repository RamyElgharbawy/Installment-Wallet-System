const { check } = require("express-validator");
const validatorMiddleware = require("../middleware/validation.middleware");
const prisma = require("../config/prisma-db");

// @desc    signup validator
exports.signupValidator = [
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

  ,
  validatorMiddleware,
];

// @desc    signup validator
exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("Invalid email address"),

  check("password").notEmpty().withMessage("Password Required"),

  validatorMiddleware,
];
