const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated ,isAdmin ,isLoggedIn } = require("../config/auth");

// Welcome Page
router.get("/", (req, res) => res.render("welcome"));

// Dashboard
router.get("/dashboard"  , ensureAuthenticated, isLoggedIn , (req, res) =>
  res.render("dashboard", {
    name: req.user.name,
    id: req.user.id,
  })
);

module.exports = router;
