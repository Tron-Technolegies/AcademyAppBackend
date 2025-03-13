import { Router } from "express";
import {
  compareFace,
  forgotPassword,
  // faceRecognition,
  loginUser,
  logout,
  registerUser,
  resetPassword,
  saveFace,
  sendResetPassword,
  verifyOtp,
} from "../controllers/authController.js";
import {
  validateForgotPasswordInput,
  validateLoginInput,
  validateOtpInput,
  validateRegisterInput,
  validateResetPasswordInput,
} from "../middleware/validationMiddleware.js";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";
import upload from "../middleware/multerMiddleware.js";

const router = Router();
router.post("/register", validateRegisterInput, registerUser);
router.post("/login", validateLoginInput, loginUser);
router.post("/verify", validateOtpInput, authenticateUser, verifyOtp);
router.post("/logout", logout);
router.patch("/addFace", authenticateUser, upload.single("face"), saveFace);
router.patch(
  "/verifyFace",
  authenticateUser,
  upload.single("face"),
  compareFace
);
router.get("/resetPassword/:id", sendResetPassword);
router.post("/forgotPassword", validateForgotPasswordInput, forgotPassword);
router.post("/forgotPassword/:id", validateResetPasswordInput, resetPassword);

export default router;
