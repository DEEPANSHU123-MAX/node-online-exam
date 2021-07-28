const express = require("express");

const router = new express.Router();

const User = require("../models/user");

const bcrypt = require("bcryptjs");

const passport = require("passport");

router.get("/login", (req, res) => res.render("login"));

router.get("/register", (req, res) => res.render("register"));

// router.get("/dashboard", (req, res) => res.render("dashboard"));

router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
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
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
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
