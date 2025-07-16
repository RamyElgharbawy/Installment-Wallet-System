const express = require("express");
const router = express.Router();

const {
  createUser,
  updateUser,
  getAllUser,
  getUser,
  deleteUser,
  changeUserPassword,
  changeLoggedUserPassword,
  updateLoggedUserData,
  getLoggedUserData,
} = require("../services/user.services");
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  changeLoggedUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../validator/user.validator");

const authServices = require("../services/auth.services");

const { sanitizeUserInputs } = require("../middleware/sanitizeDataInputs");

//  protected routes [All routes under protect *]
router.use(authServices.protect);

router.put(
  "/changeMyPassword",
  changeLoggedUserPasswordValidator,
  changeLoggedUserPassword
);

router.put(
  "/updateMyData",
  getLoggedUserData,
  updateLoggedUserValidator,
  updateLoggedUserData
);

router.get("/profile", getLoggedUserData, getUserValidator, getUser);

router
  .route("/")
  .post(
    authServices.allowedTo("admin", "moderator"),
    createUserValidator,
    sanitizeUserInputs,
    createUser
  )
  .get(authServices.allowedTo("admin", "moderator"), getAllUser);

router
  .route("/:id")
  .get(authServices.allowedTo("admin", "moderator"), getUserValidator, getUser)
  .put(
    authServices.allowedTo("admin", "moderator"),
    updateUserValidator,
    updateUser
  )
  .delete(authServices.allowedTo("admin"), deleteUserValidator, deleteUser);

router
  .route("/changePassword/:id")
  .put(
    authServices.allowedTo("admin", "moderator"),
    changeUserPasswordValidator,
    changeUserPassword
  );

module.exports = router;
