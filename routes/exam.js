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
  const exam = new Exam(req.body);
  exam.save();
  res.redirect("/exam");
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

router.get("/exam", async (req, res) => {
  const exams = await Exam.find({}); // this will return an array of all exams
  res.render("all_exams", { exams });
});

//---------------------------------------exam------------------------------------------

//---------------------------------------question------------------------------------------

// get all
// route - question
// var user_id = '6118d5a7f5452f6d54236080';
//  Exam.findById(user_id ,(err , exam )=>{
  

//     exam.questions = exam.questions.concat({ questionName:"what is grammar" });
//     exam.save();
    
//  }) 
// console.log(exam)
  //  exam.questions = exam.questions.concat({ questionName:"what is science" });
    

// router.get("/create_question", async (req, res) => {
//   const question = await new Exam({
//     questionName:"first question",
    
//   });
//   question.save()
//   // res.redirect("/question");
// });

router.get("/all_Questions_data", async (req, res) => {
  
 
  const exam_dropdown = await Exam.find({})
  
    const exam = await Exam.find({name : req.query.search})
    
    exam.forEach((x)=>{
      
      var name =x.questions
      if(name.length!=0){
      
       res.render("all_question_data",{questions :name, exam_name:exam_dropdown , exam_id:x.id})
      }else{
        console.log("no question available")
        
      }
      
    })
    
      
    
    
  
});

router.get("/all_Questions_table", async (req, res) => {
  const exam = await Exam.find({})
 
  
    res.render("all_questions",{exam_name:exam});

  
});

router.get("/question", async (req, res) => {
  const exam = await Exam.find({});
  res.redirect("/question");
});

// edit question
// route - question/edit/:id patch

router.get("/question/edit/:id", async (req, res) => {
  const exam = await Exam.findByIdAnd;
});

router.patch("/question/:id", async (req, res) => {
  const id = req.params.id;
  const exam = await Exam.findByIdAndUpdate({ _id: id }, req.body);
});

router.get("/question/delete/:id/:exam_id", async (req, res) => {
  const id = req.params.id;
  const exam_id = req.params.exam_id
  // console.log(id)
  // console.log(exam_id)

  
  const data =await Exam.updateOne({_id:exam_id} , { $pull: {questions:{ _id:id} }});
  res.redirect('back');
});

//---------------------------------------question------------------------------------------

module.exports = router;
