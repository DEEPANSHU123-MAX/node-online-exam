const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
    default:" "
  },
  phone_no: {
    type: Number,
    required: true,
    default:" "
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: { type: String, required: true, default: "student" },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
