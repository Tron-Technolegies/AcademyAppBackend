import { Router } from "express";
import {
  createPaymentIntent,
  handlePaymentSuccess,
  stripeWebHook,
} from "../controllers/paymentController.js";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";

const router = Router();
router.post("/create-payment-intent", authenticateUser, createPaymentIntent);
router.post("/payment-success", authenticateUser, handlePaymentSuccess);
router.post("/webhook", stripeWebHook);

export default router;
