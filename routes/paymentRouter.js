import { Router } from "express";
import {
  createPaymentIntent,
  handlePaymentSuccess,
  stripeWebHook,
} from "../controllers/paymentController.js";

const router = Router();
router.post("/create-payment-intent", createPaymentIntent);
router.post("/payment-success", handlePaymentSuccess);
router.post("/webhook", stripeWebHook);

export default router;
