const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const admin = require("firebase-admin");
const moment = require("moment");

const [basic, pro, business] = [
  // Price ID goes here...
];

// Create a Stripe checkout session for a subscription
exports.createSubscriptionCheckoutSession = async (req, res) => {
  const { plan, userId } = req.body;
  let planId = null;

  if (plan == 99) planId = basic;
  else if (plan == 499) planId = pro;
  else if (plan == 999) planId = business;

  try {
    const user = await admin.auth().getUser(userId);

    const newCustomer = await stripe.customers.create({
      email: user.email,
      name: user.displayName,
    });
    const stripeCustomerId = newCustomer.id;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: stripeCustomerId,
      line_items: [
        {
          price: planId,
          quantity: 1,
        },
      ],
      success_url: "http://path/success", // Change the success URL
      cancel_url: "http://path/cancel", // Change the cancel URL
    });

    await admin
      .database()
      .ref("users")
      .child(user.uid)
      .child("subscription")
      .update({
        sessionId: session.id,
        customerId: stripeCustomerId,
      });

    return res.json({ session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle payment success
exports.paymentSuccess = async (req, res) => {
  const { sessionId, firebaseId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const subscriptionId = session.subscription;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const user = await admin.auth().getUser(firebaseId);
      const planId = subscription.plan.id;
      const planType =
        subscription.plan.amount === 9900
          ? "basic"
          : subscription.plan.amount === 49900
          ? "pro"
          : subscription.plan.amount === 99900
          ? "business"
          : "unknown";
      const startDate = moment
        .unix(subscription.current_period_start)
        .format("YYYY-MM-DD");
      const endDate = moment
        .unix(subscription.current_period_end)
        .format("YYYY-MM-DD");
      const durationInSeconds =
        subscription.current_period_end - subscription.current_period_start;
      const durationInDays = moment
        .duration(durationInSeconds, "seconds")
        .asDays();

      await admin
        .database()
        .ref("users")
        .child(user.uid)
        .child("subscription")
        .update({
          planId: planId,
          planType: planType,
          planStartDate: startDate,
          planEndDate: endDate,
          planDuration: durationInDays,
        });

      return res.json({ message: "Payment successful" });
    } else {
      return res.json({ message: "Payment failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a Stripe billing portal session
exports.createCustomerPortalSession = async (req, res) => {
  const { customerId } = req.body;

  //   console.log(customerId);

  try {
    const userRef = await admin
      .database()
      .ref("users")
      .child(customerId)
      .child("subscription");
    const snapshot = await userRef.once("value");
    const subscriptionDetails = snapshot.val();

    // console.log(subscriptionDetails.customerId);

    const session = await stripe.billingPortal.sessions.create({
      customer: subscriptionDetails.customerId,
      return_url: "http://localhost:5173/",
    });

    // console.log(session);

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: "Failed to create customer portal session" });
  }
};

// Fetch subscription details of a user
exports.getSubscriptionDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await admin.auth().getUser(userId);
    const snapshot = await admin
      .database()
      .ref("users")
      .child(user.uid)
      .once("value");
    const subscriptionDetails = snapshot.val()?.subscription;

    if (!subscriptionDetails) {
      return res.status(404).json({ error: "No subscription details found." });
    }

    res.json({ subscriptionDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
