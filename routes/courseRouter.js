import { Router } from "express";
import {
  addCourse,
  deleteCourse,
  getAllCourse,
  getCourseByCategory,
  getEnrolledCourse,
  getSingleCourse,
  makeCourseProgress,
  updateCourse,
  updateEnrollCourse,
} from "../controllers/courseController.js";
import {
  validateCourseInput,
  validateCourseProgressInput,
  validateEnrollCourseInput,
} from "../middleware/validationMiddleware.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";

const router = Router();
router.post("/addCourse", validateCourseInput, isAdmin, addCourse);
router.get("/getCourse", getAllCourse);
router.patch("/updateCourse/:id", validateCourseInput, isAdmin, updateCourse);
router.get("/getCourse/:id", getSingleCourse);
router.delete("/deleteCourse/:id", isAdmin, deleteCourse);
router.get("/getCourseByCategory", getCourseByCategory);
router.patch(
  "/updateEnrollCourse",
  validateEnrollCourseInput,
  updateEnrollCourse
);
router.get("/getEnrolledCourse", getEnrolledCourse);
router.post(
  "/course-progress",
  validateCourseProgressInput,
  makeCourseProgress
);
export default router;
