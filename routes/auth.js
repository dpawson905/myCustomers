const express = require('express');
const router = express.Router();
const {
  postLogin,
  getLogout
} = require('../controllers');
const {
  isAuthenticated,
  isNotAuthenticated
} = require('../middleware');

/* POST /login */
router.post('/login', isAuthenticated, postLogin);

/* GET /logout */
router.get('/logout', isNotAuthenticated, getLogout);

module.exports = router;