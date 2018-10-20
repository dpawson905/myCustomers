const express = require('express');
const router = express.Router();
const {
  verifyUser,
  postPassword
} = require('../controllers/validate');
const {
  asyncErrorHandler,
  isAuthenticated
} = require('../middleware');

router.get('/', (req, res) => {
  res.send('Validate')
})

router.get('/token-validate', isAuthenticated, (req, res) => {
  res.render('token-validate');
})

/* POST validate */
router.post('/token-validate', isAuthenticated, asyncErrorHandler(verifyUser));

/* GET set-password */
router.get('/set-password', isAuthenticated, (req, res) => {
  res.render('set-password');
});

/* POST set-password */
router.post('/set-password', isAuthenticated, asyncErrorHandler(postPassword));

module.exports = router;