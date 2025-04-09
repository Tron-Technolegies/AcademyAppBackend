import { NotFoundError } from "../errors/customErrors.js";
import Payment from "../models/PaymentModel.js";
import User from "../models/UserModel.js";
import stripe from "../services/stripe.js";

export const createPaymentIntent = async (req, res) => {
  const { amount, currency, paymentMethod } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("No users found");
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.firstName,
      metadata: { userId: user._id.toString() },
    });
    user.stripeCustomerId = customer.id;
    await user.save();
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency || "inr",
    customer: user.stripeCustomerId,
    // payment_method_types: ["card", "upi"],
    metadata: { userId: user._id.toString() },
  });
  const payment = new Payment({
    user: user._id,
    amount,
    currency: currency || "inr",
    status: "pending",
    stripePaymentIntentId: paymentIntent.id,
    paymentMethod,
  });
  await payment.save();
  console.log("payment secret: ", paymentIntent.client_secret);

  res.status(200).json({
    client_secret: paymentIntent.client_secret,
    payment_id: payment._id,
  });
};

export const handlePaymentSuccess = async (req, res) => {
  const { paymentId, paymentIntentId } = req.body;
  console.log("paymentID:", paymentId);
  console.log("paymentIntentID:", paymentIntentId);

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  console.log("paymentIntent:", paymentIntent);

  const payment = await Payment.findById(paymentId).populate("user");
  if (!payment) throw new NotFoundError("No Payment data found");
  payment.status = paymentIntent.status === "succeeded" ? "success" : "failed";
  payment.stripeChargeId = paymentIntent.charges.data[0]?.id;
  payment.paymentGatewayResponse = paymentIntent;
  await payment.save();
  if (payment.status === "success") {
    const user = await User.findById(req.user.userId);
    user.transactions.push(payment._id);
    if (req.body.savePaymentMethod) {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentIntent.payment_method
      );
      user.paymentMethods.push({
        paymentMethodId: paymentMethod.id,
        cardBrand: paymentMethod.card?.brand,
        cardLast4: paymentMethod.card?.last4,
        isDefault: user.paymentMethods.length === 0,
      });
      user.subscriptionType = "subscriber";
      const startDate = new Date();
      user.subscriptionHistory.push({
        subscriptionName: "Individual",
        startDate: startDate,
        endDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      });
      user.subscriptionStartDate = startDate;
      user.subscriptionEndDate = new Date(
        startDate.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      await user.save();
    }
  }
  res.status(200).json({ success: true, payment });
};

export const stripeWebHook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  switch (event.type) {
    case "payment_intent.succeeded":
      await handleSuccessfulPayment(event.data.object);
      break;
    case "payment_intent.payment_failed":
      await handleFailedPayment(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
};

async function handleSuccessfulPayment(paymentIntent) {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (payment) {
    payment.status = "success";
    payment.stripeChargeId = paymentIntent.charges.data[0]?.id;
    payment.paymentGatewayResponse = paymentIntent;
    await payment.save();
  }
}

async function handleFailedPayment(paymentIntent) {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });
  if (payment) {
    payment.status = "failed";
    payment.paymentGatewayResponse = paymentIntent;
    await payment.save();
  }
}
