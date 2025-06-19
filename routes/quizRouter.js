import { Router } from "express";

import {
  addQuiz,
  calculateCourseScore,
  calculateQuizScore,
  deleteQuiz,
  getAllQuiz,
  getCourseLeaderboard,
  getLeaderboard,
  getQuizByCourse,
  getQuizByModule,
  getSingleQuiz,
  submitQuizResult,
  updateQuiz,
} from "../controllers/quizController.js";
import { validateQuizInput } from "../middleware/validationMiddleware.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";

const router = Router();

router.get("/quizByCourse", getQuizByCourse);
router.get("/quizByModule", getQuizByModule);
router.get("/courseScore", calculateCourseScore);
router.get("/getLeaderBoard", getCourseLeaderboard);
router.get("/getOverAllLeaderBoard", getLeaderboard);

router.post("/calculateScore/:id", calculateQuizScore);
router.post("/saveResult", submitQuizResult);

router.post("/addQuiz", validateQuizInput, isAdmin, addQuiz);
router.get("/getAllQuiz", getAllQuiz);
router.patch("/updateQuiz/:id", validateQuizInput, isAdmin, updateQuiz);
router.get("/getQuiz/:id", getSingleQuiz);
router.delete("/deleteQuiz/:id", isAdmin, deleteQuiz);

export default router;
