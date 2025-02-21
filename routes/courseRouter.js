import { Router } from "express";
import {
  addCourse,
  deleteCourse,
  getAllCourse,
  getSingleCourse,
  updateCourse,
} from "../controllers/courseController.js";
import { validateCourseInput } from "../middleware/validationMiddleware.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";

const router = Router();
router.post("/addCourse", validateCourseInput, isAdmin, addCourse);
router.get("/getCourse", getAllCourse);
router.patch("/updateCourse/:id", validateCourseInput, isAdmin, updateCourse);
router.get("/getCourse/:id", getSingleCourse);
router.delete("/deleteCourse/:id", isAdmin, deleteCourse);

export default router;
