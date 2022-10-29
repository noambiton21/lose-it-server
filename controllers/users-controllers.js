const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
require("dotenv").config({ path: "../vars/vars.env" });

const HttpError = require("../models/http-error");
const User = require("../models/user");
const WeightHistory = require("../models/weightHistory");
const Workout = require("../models/workout");

const getCurrentWeight = async (userEmail) => {
  const weightHistory = await WeightHistory.find({
    userEmail: userEmail,
  });
  const currentWeight = weightHistory.reduce((prev, curr) => {
    return prev.timestamp > curr.timestamp ? prev : curr;
  }, weightHistory[0]);

  return currentWeight.weight;
};

const calculateCalorieGoal = async (user) => {
  const age = moment().diff(user.dateOfBirth, "years", true);
  const currentWeight = await getCurrentWeight(user.email);
  let BMR = 0;

  // TODO: change to current weight and use real age
  if (user.gender === "M") {
    BMR = 88.362 + 13.397 * currentWeight + 4.799 * user.height - 5.677 * age;
  } else {
    BMR = 447.593 + 9.247 * currentWeight + 3.098 * user.height - 4.33 * age;
  }

  return Math.round(1.2 * BMR - 500);
};

const getUser = async (req, res, next) => {
  try {
    let existingUser = await User.findById(req.userData.userId);

    if (existingUser) {
      const calorieGoal =
        existingUser && existingUser.onboarded
          ? await calculateCalorieGoal(existingUser)
          : 0;
      existingUser._doc.calorieGoal = calorieGoal;

      res.json(existingUser);
    } else {
      res.json();
    }
  } catch (ex) {
    next(ex);
  }
};

const updateUser = async (req, res, next) => {
  try {
    let user = await User.findOne({ _id: req.userData.userId });
    if (user) {
      const userData = req.body;

      let existingUser = await User.findOne({ email: user.email });

      await existingUser.updateOne({ ...userData, onboarded: true });
      await WeightHistory.create({
        userEmail: user.email,
        timestamp: new Date(),
        weight: userData.initialWeight,
      });

      res.json("ok");
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (ex) {
    next(ex);
  }
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    email,
    password: hashedPassword,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.jwt_secret
      // { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.jwt_secret
      // { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

const getWeightHistory = async (req, res, next) => {
  try {
    const { email } = await User.findById(req.userData.userId);

    res.json(await WeightHistory.find({ userEmail: email }));
  } catch (ex) {
    next(ex);
  }
};

const addWeightHistory = async (req, res, next) => {
  try {
    const { email } = await User.findOne({ _id: req.userData.userId });
    const { timestamp, weight } = req.body;

    await WeightHistory.create({ userEmail: email, timestamp, weight });
    res.send();
  } catch (ex) {
    next(ex);
  }
};

const getWorkout = async (req, res, next) => {
  try {
    const { email } = await User.findOne({ _id: req.userData.userId });
    const date = new Date().toLocaleDateString("en-GB");

    let existWorkout = await Workout.find({
      date: date,
      userEmail: email,
    });

    res.json(existWorkout);
  } catch (ex) {
    next(ex);
  }
};

const addWorkout = async (req, res, next) => {
  try {
    const { email } = await User.findOne({ _id: req.userData.userId });
    const { caloriesBurned, date, activity, workoutTime, heartRate } = req.body;

    await Workout.create({
      userEmail: email,
      caloriesBurned,
      date,
      activity,
      workoutTime,
      heartRate,
    });
    res.send();
  } catch (ex) {
    next(ex);
  }
};

exports.getWeightHistory = getWeightHistory;
exports.addWeightHistory = addWeightHistory;
exports.updateUser = updateUser;
exports.getUser = getUser;
exports.signup = signup;
exports.login = login;
exports.addWorkout = addWorkout;
exports.getWorkout = getWorkout;
