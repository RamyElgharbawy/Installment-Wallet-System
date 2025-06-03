const express = require("express");
const authService = require("../services/auth.services");

const {
  setPercentage,
  getAllPercentage,
  getPercentage,
  updatePercentage,
  deletePercentage,
  bankInstFeesCalculation,
} = require("../services/bankFees.services");
const {
  setPercentageValidator,
  getPercentageValidator,
  updatePercentageValidator,
  deletePercentageValidator,
  bankInstFeesCalculationValidator,
} = require("../validator/bankFees.validator");

const router = express.Router();

router.use(authService.protect);

router
  .route("/feesCalc")
  .post(bankInstFeesCalculationValidator, bankInstFeesCalculation);

router
  .route("/")
  .post(
    authService.allowedTo("admin", "moderator"),
    setPercentageValidator,
    setPercentage
  )
  .get(authService.allowedTo("admin", "moderator"), getAllPercentage);

router.use(authService.allowedTo("admin", "moderator"));
router
  .route("/:id")
  .get(getPercentageValidator, getPercentage)
  .put(updatePercentageValidator, updatePercentage)
  .delete(deletePercentageValidator, deletePercentage);

module.exports = router;
