import { Router } from "express";

import {
  addToHistory,
  addUserDetails,
  clearHistory,
  getAllHistory,
  getAllSavedVideo,
  getUserInfo,
  managePlan,
  removeFromHistory,
  saveVideo,
  unSaveVideo,
  updatePassword,
  updateProfilePic,
  updateUserDetails,
} from "../controllers/userController.js";
import {
  validateSaveVideoInput,
  validateUpdateDetailsInput,
  validateUpdatePasswordInput,
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
router.patch("/updatePassword", validateUpdatePasswordInput, updatePassword);
router.get("/getAllSavedVideo", getAllSavedVideo);
router.get("/getAllHistory", getAllHistory);
router.patch("/subscription", managePlan);

export default router;
