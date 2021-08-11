const express = require("express");

const router = new express.Router();

const sg_mail = require("@sendgrid/mail");

const Api_key =
  "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";

const jwt = require("jsonwebtoken");

const auth = require("../config/auth")

const nodemailer = require("nodemailer");

const jwt_secret = "some super secret";

const User = require("../models/user");

const bcrypt = require("bcryptjs");

const passport = require("passport");
const { getMaxListeners } = require("../models/user");

router.get("/login", (req, res) => res.render("login"));

router.get("/register", (req, res) => res.render("register"));

//student profile

router.get("/student_profile", (req, res) => {
  const user = User.find({ type: "student" }, (err, user) => {
   

    res.render("student_data", { users : user });
   
  });
  
});

router.get("/admin_dash", (req, res) =>
  res.render("admin_dash", { name: req.user.name })
);

// router.get("/dashboard", (req, res) => res.render("dashboard"));
router.get("/forgot-password", (req, res, next) =>
  res.render("forgot-password")
);

router.post("/forgot-password", (req, res, next) => {
  const { email } = req.body;
  User.findOne({ email: email }).then((user) => {
    if (!user) {
      res.send("not exist");
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
      from: "tyagideepanshu825@gmail.com",
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
});

router.post("/register", (req, res) => {
  const { name, email, address, phone_no, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !phone_no || !address || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          address,
          phone_no,
          password,
        });

        //hashing a

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
    });
  }
});
// Login
router.post("/login", async (req, res, next) => {
  let redirect = "/dashboard";
  const { email } = req.body;
  // console.log(email, "==");
  const user = await User.findOne({ email });
  if (user.type === "admin") {
    redirect = "/users/admin_dash";
    
  }

  passport.authenticate("local", {
    successRedirect: redirect,
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});
module.exports = router;
