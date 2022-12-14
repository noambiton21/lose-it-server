const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.post(
  "/register",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

router.use(checkAuth);

router.get("/user", usersController.getUser);

router.put("/user", usersController.updateUser);

router.get("/user/weight-history", usersController.getWeightHistory);

router.post("/user/weight-history", usersController.addWeightHistory);

router.get("/user/workout", usersController.getWorkout);

router.post("/user/workout", usersController.addWorkout);

router.get("/user/weight", usersController.getUserWeight);

module.exports = router;
