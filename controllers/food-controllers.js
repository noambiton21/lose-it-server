const axios = require("axios");
const config = require("../config.json");
const MealOption = require("../models/mealOption");

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
