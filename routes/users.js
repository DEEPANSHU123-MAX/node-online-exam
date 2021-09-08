const express = require("express");

 require("dotenv").config();

// console.log(dotenv.parsed);

const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
  isLoggedIn,
} = require("../config/auth");
const router = new express.Router();

const sg_mail = require("@sendgrid/mail");

const Api_key = process.env.SENDGRID_API;

const jwt = require("jsonwebtoken");

const jwt_secret = "some super secret";

const User = require("../models/user");
const Exam = require("../models/exam");

const bcrypt = require("bcryptjs");

const passport = require("passport");
const { getMaxListeners } = require("../models/user");

router.get("/login", (req, res) => res.render("welcome"));

router.get("/register", (req, res) => res.render("register"));

// router.get("/Exam", ensureAuthenticated, (req, res) =>
//   res.render("Exam", { name: req.user.name })
// );

router.get("/student_profile", ensureAuthenticated, isAdmin , async(req, res) => {
 
  const user = await  User.find({ type: "student" }).sort({ date: -1 })
      res.render("student_data", { users: user });
    
  
});

router.get("/admin_dash", ensureAuthenticated, isAdmin, (req, res) =>
  res.render("admin_dash", { name: req.user.name , id:req.user.id})
);

// Admin  Profile
 router.get("/admin_profile",(req,res)=>{
  res.render("admin_profile",{name:req.user.name, email:req.user.email, phone_no:req.user.phone_no, address:req.user.address , id:req.user.id})
 });




  



//admin detail update
router.patch('/admin/:id', ensureAuthenticated ,async(req,res)=>{
  
  await User.findByIdAndUpdate(req.params.id,req.body);
 
 
  try
  {
      res.redirect("/users/admin_dash")
  }catch(e)
  {
  console.log("Something Went Problem");
   }
});
//show data on admin profile form 
router.get('/admin/:id/edit',async(req,res)=>{
 
  try{
   
      const user = await User.findById(req.params.id)
      res.render('admin_profile',{user})
      console.log(user)
     
  }
  catch(e){
      console.log(e.message)
          res.render() 
  }
  
  });


//admin password change
  
router.post("/admin_profile/password", ensureAuthenticated ,(req ,res)=>{ 

  
  let session = req.session ;
  
console.log(req.body)
  const user_Email=session.req.user.email

  var pass = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
 
  

  if (user_Email){
      var old_password = req.body.oldpassword ;
      var new_password = req.body.newpassword ;
      if (!new_password.match(pass)) {
        console.log("passs")
        req.flash("error_msg", "enter a strong password atleast 8 digit upper lower and special case in it");
       
        res.redirect('back')
      } else {
        console.log("passs --------------")
       var confirm_password = req.body.confirmpassword ;
    User.findOne({"email":user_Email},(err,user)=>{
      
      if(user!=null){
          var hash =user.password;
          bcrypt.compare(old_password,hash,(err,response)=>{

            if(response){
              if(new_password === confirm_password){
                console.log("qwerrefwwdcdwc")
                bcrypt.hash(new_password,3,(err,hash)=>{
                  user.password=hash;
                  user.save(function(err,user){
                    if(err) return console.error(err)

                    req.flash("success_msg", "your password has been changed");
                    res.redirect("/users/admin_dash")

                    console.log(" your password has been changed");
                   
                  })
                })
              }else{
                req.flash("error_msg", "password mismatch");
                res.redirect("back")

              }
            }else{
              req.flash("error_msg", "old password is wrong");
              res.redirect("back")
            }
          })
      }
    })
  
  }
}
  
 
});





// router.get("/dashboard", (req, res) => res.render("dashboard"));
router.get("/forgot-password", (req, res, next) =>
  res.render("forgot-password")
);

router.post("/forgot-password", (req, res, next) => {
  const { email } = req.body;
  User.findOne({ email: email }).then((user) => {
    if (!user) {
      res.send("User not exist");
      return;
    }

    const secret = jwt_secret + user.password;
    // console.log(secret);
    // console.log(user.password);

    const payload = {
      email: user.email,
      id: user.id,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "15m" });
    const link = `http://localhost:5000/users/reset_password/${user.id}/${token}`;
    // console.log(link);
    sg_mail.setApiKey(Api_key);

    const message = {
      to: user.email,
      from: "deepanshut691@gmail.com",
      subject: "reset your password by using",
      html: `http://localhost:5000/users/reset_password/${user.id}/${token}`,
    };
    sg_mail
      .send(message)
      .then((x) => {
        console.log("email sent");
        req.flash(
          "success_msg",
          "password reset link is send to your email id"
        );
        res.redirect("/users/login");
      })
      .catch((err) => console.log(err));

    // res.send("password reset is send to email");
  });
});

router.get("/reset_password/:id/:token", (req, res, next) => {
  const { id, token } = req.params;

  User.findById(id, (err, user) => {
    if (!user) {
      res.send("no user exist");
    }

    const secret = jwt_secret + user.password;
    try {
      const payload = jwt.verify(token, secret);
      res.render("reset-password", { email: user.email });
    } catch (err) {
      console.log(err);
      res.send(err.message);
    }
  });
});


router.post("/reset_password/:id/:token", (req, res, next) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;
  var pass = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  
  if (password != password2) {

    
    req.flash("error_msg", "password Mismatch");
    res.redirect("back")

    }else if(!password.match(pass)){
      req.flash("error_msg", "Enter a strong password atleast 8 digit upper lower and special case in it");
      res.redirect("back")
    }
    else{

  User.findById(id, (err, user) => {
    if (!user) {
      res.send("no user exist");
    }

    const secret = jwt_secret + user.password;
    try {
      const payload = jwt.verify(token, secret);

      user.password = password;
      bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) throw err;
        //hashed a password
        user.password = hash;
        //save user
        user
          .save()
          .then(() => {
            req.flash("success_msg", "your password is changed and can log in");
            res.redirect("/users/login");
          })
          .catch((err) => console.log(err));
      });
      // user.save();
      // res.send("password is successfully changed");
    } catch (err) {
      console.log(err);
    }
  });
}
});


router.post("/register", async(req, res) => {
  try{
  var phoneno = /^\d{10}$/;
  let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  var pass = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  const { name, email, address, phone_no, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !phone_no || !address || !password || !password2) {
    errors.push({ msg: "Please enter all fields " });
  }
  
  if (!email.match(regexEmail)) {
    errors.push({ msg: "Please enter valid email" });
  } 
  
  if (!phone_no.match(phoneno)) {
    errors.push({ msg: "Please enter 10 digit phone no" });
  } 
  if (!password.match(pass)) {
    errors.push({ msg: "enter a strong password atleast 8 digit upper lower and special case in it " });
  } 

  if (password != password2) {

  errors.push({ msg: "Passwords do not match" });
   
  }

  if (errors.length > 0) {
    res.render("welcome", {
      errors,
      name,
      email,
      address,
      phone_no,
      password,
      password2,
    });
  } else {
    const user = await User.findOne({ email: email  }) 
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("welcome", {
          errors,
          name,
          email,
          address,
          phone_no,
          password,
          password2,
        });
        
        
        
      } else if(!user){
        const user = await User.findOne({ phone_no: phone_no  }) 
        if (user) {
          errors.push({ msg: "phone no already exists" });
          res.render("welcome", {
            errors,
            name,
            email,
            address,
            phone_no,
            password,
            password2,
          });
      }
    else {
        const newUser = new User({
          name,
          email,
          address,
          phone_no,
          password,
        });
        const token = jwt.sign(
          { _id: newUser._id.toString() },
          "deepanshu tyagi"
        );
        newUser.tokens = newUser.tokens.concat({ token });
        

        //hashing a0

        bcrypt.hash(newUser.password, 10, function (err, hash) {
          if (err) throw err;
          //hashed a password
          newUser.password = hash;
          //save user
          newUser
            .save()
            .then(() => {
              req.flash("success_msg", "you are now register and can log in");
              res.redirect("login");
            })
            .catch((err) => console.log(err));
        });
      }
    }
    }
  
  // res.redirect("/users/register");
}catch(err){
  console.log(err)
}
});
// Login
router.post("/login", async (req, res, next) => {
  let redirect = "/dashboard";
  const {email } = req.body;
  // console.log(email, "==");
  try {
    const user = await User.findOne( (email.includes("@"))?{email:email}:{phone_no:email});
    
    if (!user) {
      req.flash("error_msg", "User is not register");
      res.redirect("login");
    }
    if (user.type === "admin") {
      redirect = "/users/admin_dash";
    }
    passport.authenticate("local", {
      successRedirect: redirect,
      failureRedirect: "/users/login",
      failureFlash: true,
    })(req, res, next);
  } catch (err) {
    console.log(err);
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

//student detail update
router.patch('/std/:id',async(req,res)=>{
  
 
  try
  {
    await User.findByIdAndUpdate(req.params.id, req.body);
      res.redirect("/dashboard")
  }catch(e)
  {
  console.log("Something Went Problem");
   }
});
//show data on student profile form
router.get('/std/:id/edit',async(req,res)=>{
  try{
   
      const user = await User.findById(req.params.id)
      res.render('student_profile',{user})
  }
  catch(e){
      console.log(e.message)
          res.render() 
  }
  
  });
//student data delete
router.get("/delete_student/:id", function (req, res, next) {
  User.findByIdAndDelete(req.params.id, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      console.log("Deleted ");
    }
  });
  res.redirect("/users/student_profile");
});



// student password change 



router.post("/std/:id/edit", ensureAuthenticated ,(req , res)=>{

  let session = req.session ;
  
console.log(req.body)
  const user_Email=session.req.user.email

  var pass = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
 
  

  if (user_Email){
      var old_password = req.body.oldpassword ;
      var new_password = req.body.newpassword ;
      if (!new_password.match(pass)) {
        console.log("passs")
        req.flash("error_msg", "enter a strong password atleast 8 digit upper lower and special case in it");
       
        res.redirect('back')
      } else {
        console.log("passs --------------")
       var confirm_password = req.body.confirmpassword ;
    User.findOne({"email":user_Email},(err,user)=>{
      if(user!=null){
          var hash =user.password;
          bcrypt.compare(old_password,hash,(err,response)=>{

            if(response){
              if(new_password === confirm_password){
                bcrypt.hash(new_password,3,(err,hash)=>{
                  user.password=hash;
                  user.save(function(err,user){
                    if(err) return console.error(err)

                    req.flash("success_msg", "your password has been changed");
                    res.redirect("/dashboard")

                    console.log(" your password has been changed");
                  })
                })
              }else{
                req.flash("error_msg", "password mismatch");
                res.redirect("back")

              }
            }else{
              req.flash("error_msg", "old password is wrong");
              res.redirect("back")
            }
          })
      }
    })
  
  }
}
  
 
});









router.get('/active_exams', ensureAuthenticated , isLoggedIn ,async(req,res)=>{
  try{
   
      const exams = await Exam.find({isActive:true})
      
      res.render('Active_exams',{exams})
  }
  catch(e){
      console.log(e.message)
         
  }
})

module.exports = router ;
