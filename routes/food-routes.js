const express = require("express");

const foodControllers = require("../controllers/food-controllers");

const router = express.Router();

router.get("/food", foodControllers.getFood);

router.get("/meal-options", foodControllers.getMealOption);

module.exports = router;
