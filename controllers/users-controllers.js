const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
require("dotenv").config({ path: "../vars/vars.env" });

const HttpError = require("../models/http-error");
const User = require("../models/user");
const WeightHistory = require("../models/weightHistory");

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
    if (req.session.user) {
      const calorieGoal =
        req.session.user && req.session.user.onboarded
          ? await calculateCalorieGoal(req.session.user)
          : 0;
      res.json({
        ...req.session.user,
        calorieGoal,
      });
    } else {
      res.json();
    }
  } catch (ex) {
    next(ex);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = req.session.user;
    if (user) {
      const userData = req.body;

      console.table(userData);
      console.log(user.email);

      let existingUser = await User.findOne({ email: user.email });

      await existingUser.updateOne({ ...userData, onboarded: true });
      await WeightHistory.create({
        userEmail: user.email,
        timestamp: new Date(),
        weight: userData.initialWeight,
      });
      req.session.user = { ...user, ...userData, onboarded: true };

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
    req.session.user = { email, onboarded: false };
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
      process.env.jwt_secret,
      { expiresIn: "1h" }
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
    success: true,
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
      process.env.jwt_secret,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }
  req.session.user = existingUser;
  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    success: true,
    user: existingUser,
  });
};

const getWeightHistory = async (req, res, next) => {
  try {
    const { email } = req.session.user;

    res.json(await WeightHistory.find({ userEmail: email }));
  } catch (ex) {
    next(ex);
  }
};

const addWeightHistory = async (req, res, next) => {
  try {
    const { email } = req.session.user;
    const { timestamp, weight } = req.body;

    await WeightHistory.create({ userEmail: email, timestamp, weight });
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
