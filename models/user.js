const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6, select: false },
    dateOfBirth: { type: Date },
    initialWeight: { type: Number },
    height: { type: Number },
    gender: { type: String },
    onboarded: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
