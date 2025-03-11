import { Router } from "express";
import {
  compareFace,
  // faceRecognition,
  loginUser,
  logout,
  registerUser,
  saveFace,
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
router.patch("/addFace", authenticateUser, upload.single("face"), saveFace);
router.patch(
  "/verifyFace",
  authenticateUser,
  upload.single("face"),
  compareFace
);

export default router;
