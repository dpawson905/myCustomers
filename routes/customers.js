const express = require('express');
const router = express.Router();

const {
  isAuthenticated,
  isNotAuthenticated
} = require('../middleware');

/* GET home page. */
router.get('/', isNotAuthenticated, (req, res) => {
  res.render('customers', {
    page: 'customers'
  });
});

module.exports = router;