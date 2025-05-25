const express = require("express");
const {
  getAllSpendings,
  getMySpendings,
  createSpending,
  getSpending,
  updateSpending,
  deleteSpending,
} = require("../services/spending.services");

const authServices = require("../services/auth.services");
const { getLoggedUserData } = require("../services/user.services");
const {} = require("../validator/fellows.validator");
const { setUserIdToBody } = require("../middleware/sanitizeDataInputs");
const {
  createSpendingValidator,
  getMySpendingsValidator,
  getSpendingValidator,
  updateSpendingValidator,
  deleteSpendingValidator,
} = require("../validator/spendings.validator");

const router = express.Router();

router.use(authServices.protect);

router
  .route("/mySpendings")
  .get(getLoggedUserData, getMySpendingsValidator, getMySpendings);

router
  .route("/")
  .get(authServices.allowedTo("admin", "moderator"), getAllSpendings)
  .post(setUserIdToBody, createSpendingValidator, createSpending);

router
  .route("/:id")
  .get(getSpendingValidator, getSpending)
  .put(updateSpendingValidator, updateSpending)
  .delete(deleteSpendingValidator, deleteSpending);

module.exports = router;
