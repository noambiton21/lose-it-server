const { Schema, model } = require("mongoose");

const workoutSchema = new Schema(
  {
    userEmail: { type: String, required: true },
    date: { type: String },
    caloriesBurned: { type: Number },
    activity: { type: String },
    workoutTime: { type: Number },
    heartRate: { type: Number },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Workout", workoutSchema);
