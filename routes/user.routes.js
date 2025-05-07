const express = require("express");
const {
  createUser,
  updateUser,
  getAllUser,
  getUser,
  deleteUser,
  changeUserPassword,
} = require("../services/user.services");
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
} = require("../validator/user.validator");

const router = express.Router();

router.route("/").post(createUserValidator, createUser).get(getAllUser);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);
router
  .route("/changePassword/:id")
  .put(changeUserPasswordValidator, changeUserPassword);

module.exports = router;
