const express = require("express");
const { signup, login } = require("../services/auth.services");
const {
  signupValidator,
  loginValidator,
} = require("../validator/auth.validator");

const router = express.Router();

router.route("/signup").post(signupValidator, signup);
router.route("/login").post(loginValidator, login);

module.exports = router;
