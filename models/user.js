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
  results: [
    {
      examId: mongoose.ObjectId,
      exam_name :{type:String , default:""},
      finalScore: {type:Number,default:0},
      startTime: {type:Date},
      endTime: Date,
      totalMinutesTaken: {type:Number,default:0},
      answeredQuestions: {type: mongoose.Schema.Types.Mixed,default:{}},
      attempted: Number,
      unAttempted: Number,
      totalQuestions: Number,
      status: {type:Boolean,default:false}
    },
  ],
  type: { type: String, required: true, default: "student" },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;