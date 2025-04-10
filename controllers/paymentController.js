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
  const paymentMethods = ["card"];
  if (process.env.STRIPE_PAYPAL_ENABLED === true) {
    paymentMethods.push("paypal");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency || "inr",
    customer: user.stripeCustomerId,
    payment_method_types: paymentMethods,
    metadata: { userId: user._id.toString() },
    payment_method_options: {
      paypal: {
        currency: currency || "inr",
        capture_method: "manual", // or 'automatic' based on your needs
      },
    },
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
  // console.log("paymentID:", paymentId);
  // console.log("paymentIntentID:", paymentIntentId);

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  // console.log("paymentIntent:", paymentIntent);

  const payment = await Payment.findById(paymentId).populate("user");
  if (!payment) throw new NotFoundError("No Payment data found");
  payment.status = paymentIntent.status === "succeeded" ? "success" : "failed";
  payment.stripeChargeId = paymentIntent.latest_charge || null;
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
    }
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
  res.status(200).json({ success: true, payment });
};

export const stripeWebHook = async (req, res) => {
  let event;
  try {
    console.log("Webhook received - raw body length:", req.body?.length);
    const sig = req.headers["stripe-signature"];
    const rawBody = req.body; // Already raw due to middleware
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
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
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

async function handleSuccessfulPayment(paymentIntent) {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (payment) {
    const paymentMethod = await stripe.paymentMethods.retrieve(
      paymentIntent.payment_method
    );
    payment.status = "success";
    payment.stripeChargeId = paymentIntent.latest_charge || null;
    payment.paymentGatewayResponse = paymentIntent;
    if (paymentMethod === "paypal") {
      payment.paypalDetails = {
        email: paymentMethod.paypal?.payer_email,
        payerId: paymentMethod.paypal?.payer_id,
        transactionId: paymentIntent.charges?.data[0]?.id, // Charge ID
      };
    }
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
