require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey_example.json");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment");
const port = 5000;
const customerRoutes = require("./routes/customerRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use(express.json());
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "", // Enter Database URL from Firebase
});

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

app.use("/api/v1/", customerRoutes);
app.use("/api/v1/", paymentRoutes);

console.log(process.env.STRIPE_PRIVATE_KEY);

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
