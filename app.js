const express = require("express");
const app = express();
const indexroute = require("./routes/index");
const userroute = require("./routes/users");
const expresslayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user");

const db = require("./config/keys").mongoURI;

//mongoose
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Mongodb connected.."))
  .catch((err) => console.log(err));

//body parser
app.use(express.urlencoded({ extended: false }));

// Passport Config
require("./config/passport")(passport);

//express session
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

//global vars
// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");

  // res.locals.error = req.flash('error');
  next();
});

const PORT = process.env.port || 5000;

//ejs
app.use(expresslayouts);
app.set("view engine", "ejs");

app.use(express.json());

//routes

app.use(indexroute);
app.use("/users", userroute);

app.listen(PORT, () => console.log(`Server is set up on ${PORT}`));
