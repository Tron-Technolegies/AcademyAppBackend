import { Router } from "express";
import {
  loginUser,
  registerUser,
  verifyOtp,
} from "../controllers/authController.js";
import {
  validateLoginInput,
  validateOtpInput,
  validateRegisterInput,
} from "../middleware/validationMiddleware.js";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";

const router = Router();
router.post("/register", validateRegisterInput, registerUser);
router.post("/login", validateLoginInput, loginUser);

router.post("/verify", validateOtpInput, authenticateUser, verifyOtp);

export default router;
