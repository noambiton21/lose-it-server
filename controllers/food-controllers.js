const axios = require("axios");
const config = require("../config.json");
const MealOption = require("../models/mealOption");

const getFood = async (req, res, next) => {
  console.log("im hereeeeeeeeee");
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
    const mealOptions = await MealOption.find({ order: ["priority"] });

    res.json(mealOptions);
  } catch (ex) {
    next(ex);
  }
};

exports.getMealOption = getMealOption;
exports.getFood = getFood;
