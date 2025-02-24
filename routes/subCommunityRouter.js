import { Router } from "express";

import {
  addSubCommunity,
  deleteSubCommunity,
  getAllSubCommunity,
  getSingleSubCommunity,
  updateSubCommunity,
} from "../controllers/subCommunityController.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";
import { validateSubCommunityInput } from "../middleware/validationMiddleware.js";
const router = Router();
router.post(
  "/addSubCommunity",
  validateSubCommunityInput,
  isAdmin,
  addSubCommunity
);
router.get("/getSubCommunity", getAllSubCommunity);
router.patch(
  "/updateSubCommunity/:id",
  validateSubCommunityInput,
  isAdmin,
  updateSubCommunity
);
router.get("/getSubCommunity/:id", getSingleSubCommunity);
router.delete("/deleteSubCommunity/:id", isAdmin, deleteSubCommunity);
export default router;
