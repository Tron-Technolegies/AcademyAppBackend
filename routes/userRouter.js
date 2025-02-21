import { Router } from "express";

import {
  addUserDetails,
  getUserInfo,
  updateProfilePic,
  updateUserDetails,
} from "../controllers/userController.js";
import {
  validateUpdateDetailsInput,
  validateUserDetailInput,
} from "../middleware/validationMiddleware.js";
import upload from "../middleware/multerMiddleware.js";

const router = Router();
router.post("/addDetails", validateUserDetailInput, addUserDetails);
router.get("/userInfo", getUserInfo);
router.patch("/updateDetails", validateUpdateDetailsInput, updateUserDetails);
router.patch("/updatePic", upload.single("profilePic"), updateProfilePic);

export default router;
