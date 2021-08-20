const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated ,isAdmin } = require("../config/auth");

// Welcome Page
router.get("/",ensureAuthenticated, (req, res) => res.render("welcome"));

// Dashboard
router.get("/dashboard" ,ensureAuthenticated, (req, res) =>
  res.render("dashboard", {
    name: req.user.name,
    id: req.user.id,
  })
);

module.exports = router;
