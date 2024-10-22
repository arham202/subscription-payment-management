const express = require("express");
const customerController = require("../controllers/customerController");

const router = express.Router();

router.get(
  "/get-customer-subscription",
  customerController.getCustomerSubscriptions
);

module.exports = router;
