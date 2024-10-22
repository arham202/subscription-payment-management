const express = require("express");
const router = express.Router();
const {
  createSubscriptionCheckoutSession,
  paymentSuccess,
  createCustomerPortalSession,
  getSubscriptionDetails,
} = require("../controllers/paymentController");

// Route for creating a subscription checkout session
router.post(
  "/create-subscription-checkout-session",
  createSubscriptionCheckoutSession
);

// Route for handling payment success
router.post("/payment-success", paymentSuccess);

// Route for creating a customer portal session
router.post("/create-customer-portal-session", createCustomerPortalSession);

// Route for fetching subscription details
router.get("/subscription-details/:userId", getSubscriptionDetails);

module.exports = router;
