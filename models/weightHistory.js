const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const weightHistorySchema = new Schema({
  userEmail: { type: String, required: true },
  timestamp: { type: Date, required: true },
  weight: { type: Number, required: true },
});

module.exports = mongoose.model("WeightHistory", weightHistorySchema);
