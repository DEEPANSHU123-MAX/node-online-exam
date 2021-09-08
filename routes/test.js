const express = require("express");


const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

const { formatDateForInput } = require("../Utils");
const router = new express.Router();

const User = require("../models/user");
const Exam = require("../models/exam");


//start test page 
router.get("/:id/startTest", async (req, res) => {
  const examId = req.params.id
  const exam = await Exam.findById({_id:examId})
  const total_questions =exam.questions.length
  res.render("Start_test",{total_questions , examId})
})

// when user click on start test
// '/test/:examId' POST
router.post("/:id", async (req, res) => {
  //check exam id exist

  // all questions
  
  const user = await User.findById({ _id: req.user.id });
  const result = user.results;

  const isExamexist = result.find((r) => r.examId == req.params.id);
//   console.log(isExamexist, "hui");

  //if exist don't do anything
  if (!isExamexist) {
    //[{hindi}]
    const exam = await Exam.findById({ _id: req.params.id });
  const allQuestions = exam.questions;

  let answeredQuestions = {};
  allQuestions.forEach((_, index) => {
    answeredQuestions[index + 1] = null;
  });
    const resultBody = {
      examId: exam.id,
      answeredQuestions,
      startTime: Date.now(),
      exam_name :exam.name,
    };

    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $push: { results: resultBody } }
    );

    res.render("test_questions", {
      answeredQuestions,
      question: allQuestions[0],
      currentQuestionNumber: 1,
      examId: exam.id,
      isAnswerExist:null,
    });
  } else{
    console.log("--------")
    
  req.flash("error_msg", "Already Attempted");
  res.redirect("back")
  }
  //else create
});

router.post("/update/:examId/:questionNo/:selectedOption", async (req, res) => {
  //update resultBody
  const examId = req.params.examId;
  const questionNo = req.params.questionNo;
  const selectedOption = req.params.selectedOption;
  const queryKey = `results.\$.answeredQuestions.${questionNo}`;

  const user = await User.updateOne(
    { _id: req.user.id, "results.examId": examId },
    {
      $set: {
        [queryKey]: selectedOption,
      },
    }
  );


 

  //   let user = await User.findById(req.user.id).select({
  //     results: { $elemMatch: { examId } },
  //   });
  //   console.log(
  //     user.results[0].answeredQuestions,
  //     user.results[0].answeredQuestions[1],
  //     selectedOption
  //   );
  //   user.results[0].answeredQuestions[questionNo] = selectedOption;
  //   user.markModified("results");
  //   await user.update();
  // send next Question(if any)
  res.redirect(`/test/${examId}/${Number(questionNo) + 1}`);
});

// if we directly click on question no from left side menu
router.get("/:examId/:questionNo", async (req, res) => {
//if option exist
//option1


 
  const questionNo = req.params.questionNo;
  const examId = req.params.examId;
  const exam = await Exam.findById(examId);
  const allQuestions = exam.questions;
  
  let user = await User.findById(req.user.id).select({
    results: { $elemMatch: { examId } },
  });

  const answeredQuestions = user.results[0].answeredQuestions;
  console.log(answeredQuestions);
  // for(let questionNumber in answeredQuestions) {
  //   if(answeredQuestions[questionNumber] !=null){
  //      isAnswerExist=answeredQuestions[questionNumber];
  //   }
  // }
  var isAnswerExist = answeredQuestions[questionNo];
  // console.log(isAnswerExist)
  
  
  
  if(allQuestions.length>= questionNo){
    res.render("test_questions", {
        answeredQuestions,
        examId: examId,
        question: allQuestions[questionNo - 1],
        currentQuestionNumber: questionNo,
        isAnswerExist
       
      });
  }else{
    req.flash("success_msg", "Click the finish exam button to submit");
    res.redirect("back");
  }
 
});




//final submit
router.put("/:examId/submitTest", async (req, res ) => {
  // calculate grade , attempted, time
  const examId = req.params.examId;
  let userPrevData = await User.findById(req.user.id).select({
    results: { $elemMatch: { examId } },
  });
  let result = userPrevData.results[0];
  

  const answeredQuestions = result.answeredQuestions;

  const exam = await Exam.findById(examId);
  const allQuestions = exam.questions;

  // calculate grade , attempted, unattempted
  let totalScore = 0;
  let attempted = 0;
  allQuestions.forEach((ques, index) => {
    if (ques.correctOption == answeredQuestions[index + 1]) {
      totalScore++;
    }
    if (answeredQuestions[index + 1] != null) {
      attempted++;
    }
  });
  let notAttempted = allQuestions.length - attempted;
  // calcultate time taken

  const startTime = (result.startTime);
  // console.log(startTime)
  
  

  const endTime = new Date();
  // console.log(endTime)
  function diff_minutes(dt2, dt1) {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;

    //diff in sec
    return (diff/60);
    

  }

  
  let totalMinutesTaken = diff_minutes(endTime, startTime);

  // saving result

  const user = await User.updateOne(
    { _id: req.user.id, "results.examId": examId },
    {
      $set: {
        "results.$.finalScore": totalScore,
        "results.$.endTime": Date.now(),
        "results.$.attempted": attempted,
        "results.$.unAttempted": notAttempted,
        "results.$.totalQuestions": allQuestions.length,
        "results.$.status": true,
        "results.$.totalMinutesTaken": totalMinutesTaken,
      },
    }
  );
  
 
  console.log("-----------------------")
  //redirect to result page for this exam
   res.redirect(`/test/${examId}/result/data`);
  
});

router.get("/:examId/result/data", ensureAuthenticated, async(req, res) => {
   try{  const examId = req.params.examId;
    let userPrevData = await User.findById(req.user.id).select({
      results: { $elemMatch: { examId } },
    });
    let result = userPrevData.results[0];
    const {
      finalScore,
      startTime,
      totalMinutesTaken,
      attempted,
      totalQuestions,
      unAttempted,
    } = result;
    res.render("user_result_page", {
      grade: finalScore,
      totalQuestions,
      attempted,
      startTime,
      unAttempted,
      totalTimeTaken: totalMinutesTaken,
    });}catch(err){
      res.send(err)
    }

});


router.get("/student_results", async (req, res) => {

  const exams = await Exam.find({isActive:true})
  const user =  await User.findById({_id: req.user.id})
  const results = user.results;
  if(req.query.search){
    
    const search_exam = await Exam.findOne({name : req.query.search})
    const result = results.find(element => element.examId ==search_exam.id);
    if(result){ res.render("student_result" , {result, results:[] , exams ,search_exam})}
    else{
      req.flash("error_msg", "Not Attempted");
      res.redirect("back")
    }
    
  }
  
 else if(results.length !=0){
   res.render("student_result" , {results, exams ,search_exam: ""})
 }
 else{
  req.flash("error_msg", "No test is attempted , Attempt to see the result");
  res.redirect("back")
 }
 
 
 
  // res.render("student_result",{is})

});
// router.get("/:examId/review", async (req, res) => {
//   const examId = req.params.examId;
//   let userPrevData = await User.findById(req.user.id).select({
//     results: { $elemMatch: { examId } },
//   });
//   let result = userPrevData.results[0];
//   const { attempted, unAttempted, totalQuestions } = result;
//   res.render("reviewpage", {
//     totalQuestions,
//     attempted,
//     unAttempted,
//   });
// });

module.exports = router;
