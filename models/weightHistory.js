const { Schema, model } = require("mongoose");

const weightHistorySchema = new Schema({
  userEmail: { type: String, required: true },
  timestamp: { type: Date },
  weight: { type: Number },
});

module.exports = model("WeightHistory", weightHistorySchema);
