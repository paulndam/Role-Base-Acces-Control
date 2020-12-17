/** @format */

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.Register);

router.post("/logIn", userController.LogIn);

router.get(
	"/user/:userId",
	userController.grantAccessIfLoggedIn,
	userController.getOneUser
);

router.get(
	"/allUsers",
	userController.grantAccessIfLoggedIn,
	userController.grantAccess("readAny", "profile"),
	userController.getUsers
);

router.put(
	"/user/:userId",
	userController.grantAccessIfLoggedIn,
	userController.grantAccess("updateAny", "profile"),
	userController.updateUser
);

router.delete(
	"/user/:userId",
	userController.grantAccessIfLoggedIn,
	userController.grantAccess("deleteAny", "profile"),
	userController.deleteUser
);

module.exports = router;
