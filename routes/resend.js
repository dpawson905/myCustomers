const express = require('express');
const router = express.Router();
const {
  putResend
} = require('../controllers/resend');
const {
  asyncErrorHandler,
  isAuthenticated
} = require('../middleware');

/* GET resend token */
router.get('/', isAuthenticated, (req, res) => {
  res.render('resend');
});

/* POST resend token */
router.put('/', isAuthenticated, asyncErrorHandler(putResend));

module.exports = router;