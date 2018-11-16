const express = require("express");
const router = express.Router();

const {
  getAllCustomers
} = require("../controllers/admin");

const {
  isAuthenticated,
  isNotAuthenticated,
  asyncErrorHandler,
  isAdmin
} = require("../middleware");

router.get('/', isAdmin, asyncErrorHandler(getAllCustomers));

module.exports = router;
