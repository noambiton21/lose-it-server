const { Schema, model } = require("mongoose");

const mealOptionSchema = new Schema({
  type: { type: String },
  displayName: { type: String },
  priority: { type: Number },
});

module.exports = model("MealOption", mealOptionSchema);
