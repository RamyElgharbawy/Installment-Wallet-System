const express = require("express");
const router = express.Router();

const {
  getAllFellows,
  createFellow,
  getFellow,
  updateFellow,
  deleteFellow,
} = require("../services/fellow.services");

const authServices = require("../services/auth.services");
const { getLoggedUserData } = require("../services/user.services");
const {
  createFellowValidator,
  getMyFellowsValidator,
  getFellowValidator,
  updateFellowValidator,
  deleteFellowValidator,
} = require("../validator/fellows.validator");
const { setUserIdToBody } = require("../middleware/sanitizeDataInputs");

const sharesRoute = require("./shares.routes");

// nested route
router.use("/:fellowId/shares", sharesRoute);

router.use(authServices.protect);

router
  .route("/myFellows")
  .get(getLoggedUserData, getMyFellowsValidator, getAllFellows);

router
  .route("/")
  .get(authServices.allowedTo("admin", "moderator"), getAllFellows)
  .post(setUserIdToBody, createFellowValidator, createFellow);

router
  .route("/:id")
  .get(getFellowValidator, getFellow)
  .put(updateFellowValidator, updateFellow)
  .delete(deleteFellowValidator, deleteFellow);

module.exports = router;
