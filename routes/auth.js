const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {
  postLogin,
  getLogout,
  putNexmo
} = require('../controllers');
const {
  isAuthenticated,
  isNotAuthenticated,
  asyncErrorHandler
} = require('../middleware');

router.get('/login', isAuthenticated, (req, res) => {
  res.render('login', {
    page: 'login'
  })
})

/* POST /login */
router.post('/login', isAuthenticated, postLogin);

router.get('/user/:id', isNotAuthenticated, async (req, res) => {
  let user = await User.findById(req.params.id);
  res.render('twilio', {
    user
  })
})

router.put('/user/:id', isNotAuthenticated, asyncErrorHandler(putNexmo));

/* GET /logout */
router.get('/logout', isNotAuthenticated, getLogout);

module.exports = router;