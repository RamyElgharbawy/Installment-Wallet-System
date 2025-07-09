const express = require("express");

const router = express.Router();

const sharesRoute = require("./shares.routes");

const {
  getAllItems,
  createItem,
  getItem,
  updateItem,
  deleteItem,
} = require("../services/item.services");

const authServices = require("../services/auth.services");

const {
  createItemValidator,
  deleteItemValidator,
  getItemValidator,
  updateItemValidator,
  getMyItemsValidator,
} = require("../validator/items.validator");
const { setUserIdToBody } = require("../middleware/sanitizeDataInputs");
const { getLoggedUserData } = require("../services/user.services");

// nested route
router.use("/:itemId/shares", sharesRoute);

router.use(authServices.protect);

router
  .route("/myItems")
  .get(getLoggedUserData, getMyItemsValidator, getAllItems);

router
  .route("/")
  .get(authServices.allowedTo("admin", "moderator"), getAllItems)
  .post(setUserIdToBody, createItemValidator, createItem);

router
  .route("/:id")
  .get(getItemValidator, getItem)
  .put(updateItemValidator, updateItem)
  .delete(deleteItemValidator, deleteItem);

module.exports = router;
