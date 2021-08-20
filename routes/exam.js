const express = require("express");

const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

const { formatDateForInput } = require("../Utils");
const router = new express.Router();

const Exam = require("../models/exam");

//---------------------------------------exam------------------------------------------
// exam create - name,date
// route - /exam POST
router.get("/exam/create", (req, res) => {
  res.render("exam_create");
});

router.post("/exam", async (req, res) => {
  // console.log(req.body);
  const exams = await Exam.find({});
  var found = false;
  for (var i = 0; i < exams.length; i++) {
    if (exams[i].name.toLowerCase() == req.body.name.toLowerCase()) {
      found = true;
    }
  }
  if (found == true) {
    req.flash("error_msg", "Exam name should be unique");
    res.redirect("/exam/create");
  } else {
    const exam = new Exam(req.body);
    exam.save();
    res.redirect("/exam");
  }
});

// edit exam
// route - /exam/:examId PATCH

router.post(
  "/exam/edit/:id",
  ensureAuthenticated,
  isAdmin,
  async (req, res) => {
    const id = req.params.id;
    console.log(req.query);
    const exam = await Exam.findByIdAndUpdate({ _id: id }, req.body);
    // console.log(exam, "-0-0-0-0-0- added questions");
    res.redirect("/exam");
  }
);

// edit exam
// route - exam/:id

router.get("/exam/edit/:id", ensureAuthenticated, isAdmin, async (req, res) => {
  const id = req.params.id;
  const exam = await Exam.findById(id);
  let newDateFormat = formatDateForInput(exam.date);
  res.render("exam_edit", { exam, date: newDateFormat });
});

router.get("/exam/delete/:id", async (req, res) => {
  Exam.findByIdAndDelete(req.params.id, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      console.log("Deleted ");
    }
    res.redirect("/exam");
  });
  // const id = req.params.id;
  // await Exam.findByIdAndDelete({ _id: id });
});

router.get("/exam", ensureAuthenticated, isAdmin, async (req, res) => {
  const exams = await Exam.find({}); // this will return an array of all exams
  res.render("all_exams", { exams });
});

// router.get("/select_Exam_data", ensureAuthenticated, isAdmin,async (req, res) => {
//   // const all_exams = await Exam.find({});
//   const exams = await Exam.find({name:req.query.search}); // this will return an array of all exams
//   res.render("all_exams", { exams ,all_exams});

// });

router.get("/exam/:id/active", async (req, res) => {
  const id = req.params.id;
  const exams = await Exam.findById({ _id: id }); // this will return an array of all exams
  exams.isActive = !exams.isActive;
  await exams.save();
  res.json({ status: "ok" });
});

//---------------------------------------exam------------------------------------------

//---------------------------------------question------------------------------------------

router.get("/all_Questions_data", async (req, res) => {
  const exam_dropdown = await Exam.find({});

  if (req.query.search) {
    const exam = await Exam.find({ name: req.query.search });
    

    exam.forEach((x) => {
      var name = x.questions;
      console.log(x.name)
      if (name.length != 0) {
        res.render("all_question_data", {
          questions: name,
          exam_name: exam_dropdown,
          exam_id: x.id,
          selected_exam: x.name,
        });
      } else {
        
        res.render("all_question_data", {
          questions: [],
          exam_name: exam_dropdown,
          exam_id: x.id,
          selected_exam: x.name,
        });
      }
    });
  } else {
    // console.log(exam_dropdown)
    let allQuestions = [];
    let examIds = [];
    exam_dropdown.forEach((exam) => {
      // [examid1,examid1,examid2]
      // [ques1,ques2] 
      examIds = [...examIds, ...Array(exam.questions.length).fill(exam.id)];
      allQuestions = [...allQuestions, ...exam.questions];
     
    });
    res.render("all_question_data", {
      questions: allQuestions,
      exam_name: exam_dropdown,
      exam_id: examIds,
      selected_exam: null,
    });
  }
});

router.get("/all_Questions_table/:id", async (req, res) => {
  const id = req.params.id;
  const exam = await Exam.findById({ _id: id });
  const exam_dropdown = await Exam.find({});

  res.render("all_question_data", {
    questions: exam.questions,
    exam_name: exam_dropdown,
    exam_id: exam.id,
    selected_exam:exam.name
  });
});

router.get("/question", isAdmin, async (req, res) => {
  const exam = await Exam.find({});
  res.redirect("/question");
});

// edit question
// route - question/edit/:id patch

router.get("/question/update/:questionid/:examid", async (req, res) => {
  const questionid = req.params.questionid;
  const exam = await Exam.findById({ _id: req.params.examid });
  exam.questions.forEach((x) => {
    if (x._id == questionid) {
      const question_name = x.questionName;
      res.render("question_edit", { exam, question_name, questionid });
    }
  });
});

router.post("/question/update/:questionid/:examid", async (req, res) => {
  const exam_id = req.params.examid;
  const question_id = req.params.questionid;
  const exam = await Exam.updateOne(
    {
      "questions._id": question_id,
    },
    {
      $set: {
        "questions.$.questionName": req.body.name,
      },
    }
  );
  console;
  res.redirect(`/all_Questions_table/${exam_id}`);
});

router.get("/question/delete/:id/:exam_id", async (req, res) => {
  const id = req.params.id;
  const exam_id = req.params.exam_id;
  // console.log(id)
  // console.log(exam_id)

  const data = await Exam.updateOne(
    { _id: exam_id },
    { $pull: { questions: { _id: id } } }
  );
  res.redirect("back");
});

router.get("/create_question/:id", async (req, res) => {
  res.render("create_question", { exam_id: req.params.id });
});

//add question
router.post("/add_question/:id", async (req, res) => {
  if (
    !req.body.questionName ||
    !req.body.option1 ||
    !req.body.option2 ||
    !req.body.option3 ||
    !req.body.option4 ||
    !req.body.correctOption
  ) {
    req.flash("error_msg", "All fields are mandatory");
  } else {
    const exam = await Exam.findById({ _id: req.params.id });
    const key = req.body.correctOption;
    const data = { ...req.body, ...{ correctOption: req.body[key] } };
    exam.questions.push(data);
    console.log(exam.name);
    await exam.save();
  }
  res.redirect(`back`);
});

//---------------------------------------question------------------------------------------

module.exports = router;
