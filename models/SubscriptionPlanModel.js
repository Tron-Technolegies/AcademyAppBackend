import mongoose, { model, Schema } from "mongoose";

const SubscriptionPlanSchema = new Schema(
  {
    planName: {
      type: String,
    },

    price: {
      type: String,
    },

    features: {
      type: [String],
    },

    subscribers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Plan = model("Plan", SubscriptionPlanSchema);
export default Plan;
