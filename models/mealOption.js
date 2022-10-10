const { Schema, model } = require("mongoose");

const mealOptionSchema = new Schema({
  type: { type: String },
  displayName: { type: String },
  priority: { type: Number },
  //   creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = model("MealOption", mealOptionSchema);
