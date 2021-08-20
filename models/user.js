const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator=require("mongoose-validator")

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: [
      validator({
        validator: 'isEmail',
        message: 'Oops..please enter valid email'
      })
    ],
  },
  password: {
    type: String,
    required: true,
    trim:true
  },
  address: {
    type: String,
    required: true,
    
  },
  phone_no: {
    type: Number,
    required: true,
    
    
  },
  date: {
    type: Date,
    default: Date.now,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  result: [
    {
      examId: mongoose.ObjectId,
      grade: Number,
      durtion: Date,
      attempted: Number,
    },
  ],
  type: { type: String, required: true, default: "student" },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
