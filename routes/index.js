const express = require("express");
const router = express.Router();
const User = require('../models/user');

/* GET home page. */
router.get("/", async (req, res) => {
  let user = await User.find({});
  res.render("index", { level: "home", user });
});

router.get("*", (req, res) => {
  req.flash("error", "That page doesnt appear to be available... Sorry");
  res.redirect("back");
});

module.exports = router;
