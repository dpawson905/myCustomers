const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.render("index", { page: "home" });
});

router.get("*", (req, res) => {
  req.flash("error", "That page doesnt appear to be available... Sorry");
  res.redirect("back");
});

module.exports = router;
