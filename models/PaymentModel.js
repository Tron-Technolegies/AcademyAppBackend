import mongoose, { model, Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: String,
    stripePaymentIntentId: String,
    stripeChargeId: String,
    paymentGatewayResponse: Object,
    description: String,
    metadata: Object,
  },
  { timestamps: true }
);

const Payment = model("Payment", paymentSchema);

export default Payment;
