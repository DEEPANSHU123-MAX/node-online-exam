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
      correctOption: String,
    },
  ],
});


// ExamSchema.path('name').validate(async (value) => {
//   const nameCount = await mongoose.models.Exam.countDocuments({name: value });
//   return !nameCount;
//   next()
// }, 'Exam name already exists');

const Exam = mongoose.model("Exam", ExamSchema);

module.exports = Exam;
