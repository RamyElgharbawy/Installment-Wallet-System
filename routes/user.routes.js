const express = require("express");
const {
  createUser,
  updateUser,
  getAllUser,
  getUser,
  deleteUser,
} = require("../services/user.services");

const router = express.Router();

router.route("/").post(createUser).get(getAllUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
