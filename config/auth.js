const user = require("../models/user");
module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    req.flash("error_msg", "Please log in to view the resource");
    res.redirect("/users/login");
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/dashboard");
  },
  isAdmin(req, res, next) {
    if (req.user.type == "admin") {
      return next();
    } 
      req.flash("error_msg", "only admin allowed to see that source");
      res.redirect("/dashboard");
    
   
  },
  isLoggedIn(req, res, next) {
    // console.log("---------------------------");
    // console.log(req.user, "0-0-0-0---0-");
    
    const userType = req.user.type;
    if (userType == "student") {
      return next(); 
     
    } else if (userType == "admin") {
      res.redirect("/users/admin_dash");
    
    }
  },
};
