const express = require("express");
const {
  getAllSpendings,
  createSpending,
  getSpending,
  updateSpending,
  deleteSpending,
} = require("../services/spending.services");

const authServices = require("../services/auth.services");

const {
  setUserIdToBody,
  setUserIdToParams,
} = require("../middleware/sanitizeDataInputs");
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
  .get(setUserIdToParams, getMySpendingsValidator, getAllSpendings);

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
