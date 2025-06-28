import { Router } from "express";
import {
  // compareFace,
  forgotPassword,
  googleLogin,
  // faceRecognition,
  loginUser,
  logout,
  logoutAdmin,
  registerFace,
  registerUser,
  resendOtp,
  resetPassword,
  // saveFace,
  sendResetPassword,
  verifyFace,
  verifyOtp,
} from "../controllers/authController.js";
import {
  validateForgotPasswordInput,
  validateLoginInput,
  validateOtpInput,
  validateRegisterInput,
  validateResendOtpInput,
  validateResetPasswordInput,
} from "../middleware/validationMiddleware.js";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";
import upload from "../middleware/multerMiddleware.js";

const router = Router();
router.post("/register", validateRegisterInput, registerUser);
router.post("/login", validateLoginInput, loginUser);
router.post("/verify", validateOtpInput, authenticateUser, verifyOtp);
router.post("/logout", logout);
router.post("/logoutAdmin", logoutAdmin);

router.get("/resetPassword/:id", sendResetPassword);
router.post("/forgotPassword", validateForgotPasswordInput, forgotPassword);
router.post("/forgotPassword/:id", validateResetPasswordInput, resetPassword);
router.post("/registerFace", authenticateUser, registerFace);
router.post("/verifyFace", authenticateUser, verifyFace);
router.post("/resendOtp", validateResendOtpInput, resendOtp);
router.post("/googleLogin", googleLogin);

export default router;
