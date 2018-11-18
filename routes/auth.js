const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { postLogin, getLogout, putTwilio, forgotPw } = require("../controllers");
const {
  isAuthenticated,
  isNotAuthenticated,
  asyncErrorHandler
} = require("../middleware");

/* POST /login */
router.post("/login", isAuthenticated, postLogin);

router.get("/user/:id", isNotAuthenticated, async (req, res) => {
  let user = await User.findById(req.params.id);
  res.render("twilio", {
    user
  });
});

router.get('/forgot-pw', isAuthenticated,  async (req, res) => {
  res.render("password");
})

router.post('/forgot-pw', isAuthenticated, asyncErrorHandler(forgotPw));

router.put("/user/:id", isNotAuthenticated, asyncErrorHandler(putTwilio));


/* GET /logout */
router.get("/logout", isNotAuthenticated, getLogout);

module.exports = router;
