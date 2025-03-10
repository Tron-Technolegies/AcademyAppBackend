import { Router } from "express";
import {
  // faceRecognition,
  loginUser,
  logout,
  registerUser,
  verifyOtp,
} from "../controllers/authController.js";
import {
  validateLoginInput,
  validateOtpInput,
  validateRegisterInput,
} from "../middleware/validationMiddleware.js";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";
import upload from "../middleware/multerMiddleware.js";

const router = Router();
router.post("/register", validateRegisterInput, registerUser);
router.post("/login", validateLoginInput, loginUser);
router.post("/verify", validateOtpInput, authenticateUser, verifyOtp);
router.post("/logout", logout);
// router.post(
//   "/registerFace",
//   authenticateUser,
//   upload.single("face"),
//   faceRecognition
// );
export default router;
