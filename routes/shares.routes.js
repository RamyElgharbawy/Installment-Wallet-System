const express = require("express");

const router = express.Router({ mergeParams: true });

const authService = require("../services/auth.services");

const {
  getAllShares,
  getShare,
  updateShareToPaid,
  updateShareToUnPaid,
  deleteShare,
} = require("../services/shares.services");

const { getShareValidator } = require("../validator/shares.validator");

router.use(authService.protect);

router.route("/").get(getAllShares);

router
  .route("/:id")
  .get(getShareValidator, getShare)
  .delete(getShareValidator, deleteShare);

router.route("/toPaid/:id").put(getShareValidator, updateShareToPaid);
router.route("/toUnpaid/:id").put(getShareValidator, updateShareToUnPaid);

module.exports = router;
