const express = require("express");
const app = express();
const indexroute = require("./routes/index");
const userroute = require("./routes/users");
const methodOverride = require('method-override')
const examroutes = require("./routes/exam");
const expresslayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user");
const exam = require("./models/exam");
const jwt = require("jsonwebtoken");
const MongoStore = require("connect-mongo")(session);

const db = require("./config/keys").mongoURI;
app.use(express.json());

//mongoose
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Mongodb connected"))
  .catch((err) => console.log(err));

//body parser
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// Passport Config
require("./config/passport")(passport);



//Oauth
app.use(
  session({
    secret: "Ecomhguygu",
    resave: false,
    signed: true,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 308 * 60 * 100000 },
  })
);

// Passport middleware
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

//global vars
// Global variables
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
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

//routes

app.use(indexroute);
app.use("/", examroutes);
app.use("/users", userroute);

app.listen(PORT, () => console.log(`Server is set up on ${PORT}`));
