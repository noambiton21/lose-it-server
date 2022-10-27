const axios = require("axios");
const config = require("../config.json");
const MealOption = require("../models/mealOption");
const Meal = require("../models/meal");
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
      res.json(calories);
    });
  } catch (ex) {
    next(ex);
  }
};

const getMealOption = async (req, res, next) => {
  try {
    const mealOptions = await MealOption.find({});
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

const addMeal = async (req, res, next) => {
  try {
    const { email } = req.session.user;
    const { foodName, calories, servingSize, mealType, imageUrl } = req.body;
    const date = new Date().toLocaleDateString("en-GB");

    const existMeal = await Meal.findOne({
      mealType: mealType,
      createAtDate: date,
      foodName: foodName,
      userEmail: email,
    });

    if (!existMeal) {
      if (foodName !== "") {
        await Meal.create({
          userEmail: email,
          foodName,
          calories,
          servingSize,
          mealType,
          imageUrl,
          createAtDate: date,
        });
        res.send();
      }
    }
  } catch (ex) {
    next(ex);
  }
};

const getMeal = async (req, res, next) => {
  try {
    const { email } = req.session.user;
    const { mealType, date } = req.query;

    let existMeal = await Meal.find({
      mealType: mealType,
      createAtDate: date,
      userEmail: email,
    });
    res.json(existMeal);
  } catch (ex) {
    next(ex);
  }
};

const getMeals = async (req, res, next) => {
  try {
    const { email } = req.session.user;
    const { date } = req.query;

    let existMeals = await Meal.find({
      createAtDate: date,
      userEmail: email,
    });
    res.json(existMeals);
  } catch (ex) {
    next(ex);
  }
};

const getMealCalories = async (mealType, date, email) => {
  let existMeal = await Meal.find({
    mealType: mealType,
    createAtDate: date,
    userEmail: email,
  });
  let sumCalories = 0;
  sumCalories = existMeal.reduce((accumulator, food) => {
    return accumulator + food.calories;
  }, 0);
  return sumCalories;
};

const getMealsCalories = async (req, res, next) => {
  try {
    let mealOptions = await MealOption.find({});
    mealOptions.sort((a, b) => a.priority - b.priority);

    const { email } = req.session.user;
    const { date } = req.query;

    const mealsCalories = await Promise.all(
      mealOptions.map(async (mealOption) => {
        const calories = await getMealCalories(mealOption.type, date, email);
        return {
          ...mealOption,
          totalCalories: calories,
        };
      })
    );

    res.json(mealsCalories);
  } catch (ex) {
    next(ex);
  }
};
const getTotalDayCalories = async (req, res, next) => {
  try {
    const { email } = req.session.user;
    const date = new Date().toLocaleDateString("en-GB");
    let existMeal = await Meal.find({
      createAtDate: date,
      userEmail: email,
    });
    let sumCalories = 0;
    sumCalories = existMeal.reduce((accumulator, food) => {
      return accumulator + food.calories;
    }, 0);

    res.json(sumCalories);
  } catch (ex) {
    next(ex);
  }
};

exports.getMealOption = getMealOption;
exports.getFood = getFood;
exports.addMealOption = addMealOption;
exports.getFoodCalories = getFoodCalories;
exports.addMeal = addMeal;
exports.getMeal = getMeal;
exports.getMealsCalories = getMealsCalories;
exports.getTotalDayCalories = getTotalDayCalories;
exports.getMeals = getMeals;
