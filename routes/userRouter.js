import { Router } from "express";

import {
  addUserDetails,
  getUserInfo,
  updateUserDetails,
} from "../controllers/userController.js";
import {
  validateUpdateDetailsInput,
  validateUserDetailInput,
} from "../middleware/validationMiddleware.js";

const router = Router();
router.post("/addDetails", validateUserDetailInput, addUserDetails);
router.get("/userInfo", getUserInfo);
router.patch("/updateDetails", validateUpdateDetailsInput, updateUserDetails);

export default router;
