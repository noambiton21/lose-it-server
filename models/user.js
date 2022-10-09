// const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const { Schema, model } = require("mongoose");

// const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
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

// userSchema.plugin(uniqueValidator);

module.exports = model("User", userSchema);
