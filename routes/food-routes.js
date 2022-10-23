const express = require("express");

const foodControllers = require("../controllers/food-controllers");

const router = express.Router();

router.get("/food", foodControllers.getFood);

router.get("/food-calories", foodControllers.getFoodCalories);

router.get("/meal-options", foodControllers.getMealOption);

router.post("/meal", foodControllers.addMeal);

router.get("/meal", foodControllers.getMeal);

router.get("/meals", foodControllers.getMeals);

router.get("/mealsCalories", foodControllers.getMealsCalories);

router.get("/totalDayCalories", foodControllers.getTotalDayCalories);

module.exports = router;
