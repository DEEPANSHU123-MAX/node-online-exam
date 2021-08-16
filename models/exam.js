const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  questions: [
    {
      questionName: String,
      option1: String,
      option2: String,
      option3: String,
      option4: String,
      correctOption: Number,
    },
  ],
});

const Exam = mongoose.model("Exam", ExamSchema);

module.exports = Exam;
