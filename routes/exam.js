const express = require("express");

const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

const { formatDateForInput } = require("../Utils");
const router = new express.Router();

const Exam = require("../models/exam");
const User = require("../models/user");
const paginate = require("paginate-array");

//---------------------------------------exam------------------------------------------
// exam create - name,date
// route - /exam POST
router.get("/exam/create", ensureAuthenticated , isAdmin, (req, res) => {
  res.render("exam_create");
});

router.post("/exam", ensureAuthenticated , isAdmin, async (req, res) => {
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
  try{
    let {page , size} = req.query
    if(!page){
      page = 1
    }
    if(!size){
      size=20
    }
    const limit = parseInt(size)
    const pages = parseInt(page)
    const skip =(page-1)*size
    const exams = await Exam.find({}).limit(limit).skip(skip); 
    console.log(exams)// this will return an array of all exams
    
    
  res.render("all_exams", { exams , pages,size});
  }catch(err){
    res.status(400).send();
  }
  
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

router.get("/all_Questions_data", ensureAuthenticated , isAdmin , async (req, res) => {
  const exam_dropdown = await Exam.find({}).sort({ date: -1 });

  if (req.query.search) {
    const exam = await Exam.find({ name: req.query.search });

    exam.forEach((x) => {
      var name = x.questions;
      console.log(x.name);
      if (name.length != 0) {
        res.render("all_question_data", {
          questions: name,
          exam_name: exam_dropdown,
          exam_id: x.id,
          selected_exam: x.name,
          pages:"",
          size:""
        });
      } else {
        res.render("all_question_data", {
          questions: [],
          exam_name: exam_dropdown,
          exam_id: x.id,
          selected_exam: x.name,
          pages:"",
          size:""
        });
      }
    });
  } else {
    
   
    let allQuestions = [];
    let examIds = [];
    exam_dropdown.forEach((exam) => {
     
      examIds = [...examIds, ...Array(exam.questions.length).fill(exam.id)];
      allQuestions = [...allQuestions, ...exam.questions];
      
    });
    
     let {page , size} = req.query
    if(!page){
      page = 1;
    }
    if(!size){
      size=20
    }
    const limit = parseInt(size)
    const pages = parseInt(page)
    const startindex = (pages-1)*limit
    const endindex = (pages)*limit
   
    // console.log(allQuestions)
    console.log(examIds)
    
    const Questions = allQuestions.slice(startindex ,endindex)
    const updated_examid =examIds.slice(startindex ,endindex)
    
 
    res.render("all_question_data", {
      questions: Questions,
      exam_name: exam_dropdown,
      exam_id: updated_examid,
      selected_exam: null,
      pages,
      size,
      
      
    });
   
  }
});

router.get("/all_Questions_table/:id", async (req, res) => {
  const id = req.params.id;
  const exam = await Exam.findById({ _id: id });
  const exam_dropdown = await Exam.find({});
  const pages =""

  res.render("all_question_data", {
    questions: exam.questions,
    exam_name: exam_dropdown,
    exam_id: exam.id,
    selected_exam: exam.name,
    pages,
  });
});

router.get("/question",ensureAuthenticated ,  isAdmin, async (req, res) => {
  const exam = await Exam.find({});
  res.redirect("/question");
});

// edit question
// route - question/edit/:id patch

router.get("/question/update/:questionid/:examid", async (req, res) => {
  try{
    const exams = await Exam.find({});
    const questionid = req.params.questionid;
    const exam = await Exam.findById({ _id: req.params.examid });
    exam.questions.forEach((ques) => {
      if (ques._id == questionid) {
        const question = ques;
        res.render("question_edit", { exam, question, questionid, exams });
      }
    });
  }catch(err){
    console.log(err)
  }
 
});

router.post("/question/update/:questionid/:examid", async (req, res) => {
  const exam_id = req.params.examid;
  const question_id = req.params.questionid;
  const { questionName, option1, option2, option3, option4, correctOption } =
    req.body;
  const exam = await Exam.updateOne(
    {
      "questions._id": question_id,
    },
    {
      $set: {
        "questions.$.questionName": questionName,
        "questions.$.option1": option1,
        "questions.$.option2": option2,
        "questions.$.option3": option3,
        "questions.$.option4": option4,
        "questions.$.correctOption": correctOption,
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

router.get("/create_question", async (req, res) => {
  const exam_name = await Exam.find({});
  res.render("create_question", { exam_name });
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
    console.log(key)
    const data = { ...req.body, ...{ correctOption: key } };
    exam.questions.push(data);
    
    await exam.save();
  }
  res.redirect(`back`);
});

//---------------------------------------question------------------------------------------
//---------------------------------------results for admin------------------------------------------

router.get("/results", async (req, res) => {
  
  const users = await User.find({}).sort({ date: -1 });
  // users.forEach(user=>{
  //   let username = user.name
  //   let userEmail = user.userEmail
  //   user.results.forEach(exam=>{
  //     console.log(exam)
      
  //   })
  // })
  res.render("admin_result_page", { users });
});
//---------------------------------------results for admin------------------------------------------

module.exports = router;






// var phoneno = /^\d{10}$/;
// let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
// var pass = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
// const { name, email, address, phone_no, password, password2 } = req.body;
// let errors = [];

// if (!name || !email || !phone_no || !address || !password || !password2) {
//   errors.push({ msg: "Please enter a fields " });
// }

// if (!email.match(regexEmail)) {
//   errors.push({ msg: "Please enter valid email" });
// } 

// if (!phone_no.match(phoneno)) {
//   errors.push({ msg: "Please enter 10 digit phone no" });
// } 
// if (!password.match(pass)) {
//   errors.push({ msg: "enter a strong password atleast 8 digit upper lower and special case in it " });
// } 

// if (password != password2) {

// errors.push({ msg: "Passwords do not match" });
 
// }

// if (errors.length > 0) {
//   res.render("register", {
//     errors,
//     name,
//     email,
//     password,
//     password2,
//   });
// } else {
//   User.findOne({ email: email  }).then((user) => {
//     if (user) {
//       errors.push({ msg: "Email already exists" });
//       res.render("register", {
//         errors,
//         name,
//         email,
//         password,
//         password2,
//       });
      
      
      
//     } else {
//       const newUser = new User({
//         name,
//         email,
//         address,
//         phone_no,
//         password,
//       });
//       const token = jwt.sign(
//         { _id: newUser._id.toString() },
//         "deepanshu tyagi"
//       );
//       newUser.tokens = newUser.tokens.concat({ token });
      

//       //hashing a

//       bcrypt.hash(newUser.password, 10, function (err, hash) {
//         if (err) throw err;
//         //hashed a password
//         newUser.password = hash;
//         //save user
//         newUser
//           .save()
//           .then(() => {
//             req.flash("success_msg", "you are now register and can log in");
//             res.redirect("login");
//           })
//           .catch((err) => console.log(err));
//       });
//     }
//   }).catch((err)=>{
//    console.log(err)
//   });
// }