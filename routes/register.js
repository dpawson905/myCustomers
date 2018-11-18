const express = require('express');
const router = express.Router();
const {
  postRegister
} = require('../controllers/register');
const {
  asyncErrorHandler,
  isAuthenticated
} = require('../middleware');

/* GET /register */
router.get('/', isAuthenticated, (req, res) => {
  res.render('register', {
    level: 'register'
  });
});

/* POST /register */
router.post('/', isAuthenticated, asyncErrorHandler(postRegister));

module.exports = router;