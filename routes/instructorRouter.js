import { Router } from "express";
import {
  validateInstructorInput,
  validateUpdateInstructorInput,
} from "../middleware/validationMiddleware.js";
import {
  addInstructor,
  deleteInstructor,
  getAllCoursesByInstructor,
  getAllEnrolledStudents,
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
  validateUpdateInstructorInput,
  isAdmin,
  updateInstructor,
);
router.get("/getInstructor/:id", getSingleInstructor);
router.delete("/deleteInstructor/:id", deleteInstructor);
router.get("/getAllEnrolled", getAllEnrolledStudents);
router.get("/getCoursesByInstructor", getAllCoursesByInstructor);
export default router;
