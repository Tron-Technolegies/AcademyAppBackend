import { Router } from "express";
import { validatePlanInput } from "../middleware/validationMiddleware.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";
import {
  addPlan,
  deletePlan,
  getAllPlan,
  getSinglePlan,
  updatePlan,
} from "../controllers/planController.js";

const router = Router();
router.post("/", validatePlanInput, isAdmin, addPlan);
router.get("/", getAllPlan);
router.patch("/:id", validatePlanInput, isAdmin, updatePlan);
router.get("/:id", getSinglePlan);
router.delete("/:id", isAdmin, deletePlan);
export default router;
