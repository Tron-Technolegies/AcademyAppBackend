import { Router } from "express";
import {
  createPaymentIntent,
  handlePaymentSuccess,
} from "../controllers/paymentController.js";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";

const router = Router();
router.post("/create-payment-intent", authenticateUser, createPaymentIntent);
router.post("/payment-success", authenticateUser, handlePaymentSuccess);

export default router;
