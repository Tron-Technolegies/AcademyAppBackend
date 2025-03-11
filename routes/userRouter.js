import { Router } from "express";

import {
  addToHistory,
  addUserDetails,
  clearHistory,
  getUserInfo,
  removeFromHistory,
  saveVideo,
  unSaveVideo,
  updateProfilePic,
  updateUserDetails,
} from "../controllers/userController.js";
import {
  validateSaveVideoInput,
  validateUpdateDetailsInput,
  validateUserDetailInput,
} from "../middleware/validationMiddleware.js";
import upload from "../middleware/multerMiddleware.js";

const router = Router();
router.post("/addDetails", validateUserDetailInput, addUserDetails);
router.get("/userInfo", getUserInfo);
router.patch("/updateDetails", validateUpdateDetailsInput, updateUserDetails);
router.patch("/updatePic", upload.single("profilePic"), updateProfilePic);
router.patch("/saveVideo", validateSaveVideoInput, saveVideo);
router.patch("/unSaveVideo", validateSaveVideoInput, unSaveVideo);
router.patch("/addToHistory", validateSaveVideoInput, addToHistory);
router.patch("/clearHistory", clearHistory);
router.patch("/removeFromHistory", validateSaveVideoInput, removeFromHistory);

export default router;
