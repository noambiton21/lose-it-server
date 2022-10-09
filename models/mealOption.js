const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const mealOptionSchema = new Schema({
  type: { type: String, required: true },
  displayName: { type: String, required: true },
  priority: { type: Number, required: true },
  //   creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("MealOption", mealOptionSchema);
