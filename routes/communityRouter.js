import { Router } from "express";
import { validateCommunityInput } from "../middleware/validationMiddleware.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";
import {
  addCommunity,
  deleteCommunity,
  getAllCommunity,
  getSingleCommunity,
  joinCommunity,
  updateCommunity,
  getMembersByCommunity,
} from "../controllers/communityController.js";

const router = Router();
router.post("/addCommunity", validateCommunityInput, isAdmin, addCommunity);
router.get("/getCommunities", getAllCommunity);
router.patch(
  "/updateCommunity/:id",
  validateCommunityInput,
  isAdmin,
  updateCommunity
);
router.get("/getCommunity/:id", getSingleCommunity);
router.delete(
  "/deleteCommunity/:id",

  isAdmin,
  deleteCommunity
);
router.post("/joinCommunity", joinCommunity);
router.get("/getMembersByCommunity/:id", getMembersByCommunity);

export default router;
