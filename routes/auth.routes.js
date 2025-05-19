const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require("../services/auth.services");
const {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
} = require("../validator/auth.validator");

const router = express.Router();

router.route("/signup").post(signupValidator, signup);
router.route("/login").post(loginValidator, login);
router.route("/forgotPassword").post(forgotPasswordValidator, forgotPassword);
router
  .route("/verifyResetCode")
  .post(verifyResetCodeValidator, verifyResetCode);
router.route("/resetPassword").put(resetPasswordValidator, resetPassword);

module.exports = router;
