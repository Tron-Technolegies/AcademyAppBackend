import { Router } from "express";
import { validateInstructorInput } from "../middleware/validationMiddleware.js";
import {
  addInstructor,
  deleteInstructor,
  getAllInstructor,
  getSingleInstructor,
  updateInstructor,
} from "../controllers/instructorController.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";

const router = Router();
router.post("/addInstructor", validateInstructorInput, isAdmin, addInstructor);
router.get("/getInstructor", getAllInstructor);
router.patch(
  "/updateInstructor/:id",
  validateInstructorInput,
  isAdmin,
  updateInstructor
);
router.get("/getInstructor/:id", getSingleInstructor);
router.delete("/deleteInstructor/:id", deleteInstructor);
export default router;
