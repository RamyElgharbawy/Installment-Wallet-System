const express = require("express");
const {
  getAllItems,
  createItem,
  getItem,
  updateItem,
  deleteItem,
  getMyItems,
} = require("../services/item.services");

const authServices = require("../services/auth.services");
const { adjItemData } = require("../middleware/sanitizeUserInputs");
const {
  createItemValidator,
  deleteItemValidator,
  getItemValidator,
  updateItemValidator,
} = require("../validator/items.validator");

const router = express.Router();

router.use(authServices.protect);

router.route("/myItems").get(getMyItems);

router
  .route("/")
  .get(authServices.allowedTo("admin", "moderator"), getAllItems)
  .post(createItemValidator, createItem);

router
  .route("/:id")
  .get(getItemValidator, getItem)
  .put(updateItemValidator, updateItem)
  .delete(deleteItemValidator, deleteItem);

module.exports = router;
