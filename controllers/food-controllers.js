const axios = require("axios");
const config = require("../config.json");
const MealOption = require("../models/mealOption");
const nutritionix = require("nutritionix-api");

const YOUR_APP_ID = "2bcc2d2c";
const YOUR_API_KEY = "de3bf9b51b5786a36dd96c55bbefb787";
nutritionix.init(YOUR_APP_ID, YOUR_API_KEY);

const getFood = async (req, res, next) => {
  try {
    const { query } = req.query;
    const foodList = await axios
      .get(`${config.foodApiUrl}/search/instant?query=${query}`, {
        method: "GET",
        headers: {
          "x-app-key": config.foodApiKey,
          "x-app-id": config.foodApiAppId,
        },
      })
      .then((response) => response.data.common);
    res.json(foodList);
  } catch (ex) {
    next(ex);
  }
};

const getFoodCalories = async (req, res, next) => {
  try {
    const { query } = req.query;
    let calories = 0;
    nutritionix.natural.search(query).then((result) => {
      if (result.message) {
        calories = 0;
      } else {
        calories = result.foods[0].nf_calories;
      }
      console.log(calories);
      res.json(calories);
    });
  } catch (ex) {
    next(ex);
  }
};

const getMealOption = async (req, res, next) => {
  try {
    let mealOptions = await MealOption.find({});
    mealOptions.sort((a, b) => a.priority - b.priority);
    res.json(mealOptions);
  } catch (ex) {
    next(ex);
  }
};

const addMealOption = async (req, res, next) => {
  const mealType = req.body.mealType;
  try {
    let existMealOption = await MealOption.findOne({ type: mealType });
    if (!existMealOption) {
      await MealOption.create({
        type: "lala",
        displayName: "blala",
        priority: 9,
      });
    }
  } catch (ex) {
    next(ex);
  }
};

exports.getMealOption = getMealOption;
exports.getFood = getFood;
exports.addMealOption = addMealOption;
exports.getFoodCalories = getFoodCalories;
