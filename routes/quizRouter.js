import { Router } from "express";

import {
  addQuiz,
  calculateCourseScore,
  calculateQuizScore,
  deleteQuiz,
  getAllQuiz,
  getQuizByCourse,
  getQuizByModule,
  getQuizResults,
  getSingleQuiz,
  submitQuizResult,
  updateQuiz,
} from "../controllers/quizController.js";
import { validateQuizInput } from "../middleware/validationMiddleware.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";

const router = Router();

router.get("/quizByCourse", getQuizByCourse);
router.get("/quizByModule", getQuizByModule);
router.get("/courseScore/:courseId", calculateCourseScore); //calculate score total modules in the course
// router.get("/quizResults/:id", getQuizResults);

router.post("/calculateScore/:id", calculateQuizScore);
router.post("/submitResult", submitQuizResult);

router.post("/", validateQuizInput, isAdmin, addQuiz);
router.get("/", getAllQuiz);
router.patch("/:id", validateQuizInput, isAdmin, updateQuiz);
router.get("/:id", getSingleQuiz);
router.delete("/:id", isAdmin, deleteQuiz);

export default router;
