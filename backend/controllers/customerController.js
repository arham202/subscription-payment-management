const admin = require("firebase-admin");
const moment = require("moment");
const serviceAccount = require("../serviceAccountKey_example.json");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

exports.getCustomerSubscriptions = async (req, res) => {
  const { customerId } = req.query;

  const userRef = await admin
    .database()
    .ref("users")
    .child(customerId)
    .child("subscription");
  const snapshot = await userRef.once("value");
  const subscriptionDetails = snapshot.val();

  if (!subscriptionDetails || !subscriptionDetails.customerId) {
    return res.status(200).json({ msg: "User doesn't have any subscription." });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: subscriptionDetails.customerId,
    });

    const activeSubscription = subscriptions.data.find(
      (subscription) => subscription.status === "active"
    );

    const user = await admin.auth().getUser(customerId);

    const planId = activeSubscription.plan.id;
    const planType =
      activeSubscription.plan.amount === 9900
        ? "basic"
        : activeSubscription.plan.amount === 49900
        ? "pro"
        : activeSubscription.plan.amount === 99900
        ? "business"
        : "unknown";
    const startDate = moment
      .unix(activeSubscription.current_period_start)
      .format("YYYY-MM-DD");
    const endDate = moment
      .unix(activeSubscription.current_period_end)
      .format("YYYY-MM-DD");
    const durationInSeconds =
      activeSubscription.current_period_end -
      activeSubscription.current_period_start;
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

    res.json(planType || { message: "No active subscription found" });
  } catch (error) {
    console.error("Error retrieving customer subscriptions:", error);
    res.status(500).json({ error: "Failed to retrieve subscriptions" });
  }
};
