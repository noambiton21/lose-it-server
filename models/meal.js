const { Schema, model } = require("mongoose");

const mealSchema = new Schema(
  {
    userEmail: { type: String, required: true },
    foodName: { type: String },
    calories: { type: Number },
    servingSize: { type: Number },
    createAtDate: { type: String },
    mealType: { type: String },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Meal", mealSchema);
