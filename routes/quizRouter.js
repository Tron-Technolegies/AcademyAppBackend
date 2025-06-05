import { Router } from "express";

import {
  addQuiz,
  deleteQuiz,
  getAllQuiz,
  getQuizByCourse,
  getQuizByModule,
  getSingleQuiz,
  updateQuiz,
} from "../controllers/quizController.js";
import { validateQuizInput } from "../middleware/validationMiddleware.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";

const router = Router();

router.get("/quizByCourse", getQuizByCourse);
router.get("/quizByModule", getQuizByModule);

router.post("/", validateQuizInput, isAdmin, addQuiz);
router.get("/", getAllQuiz);
router.patch("/:id", validateQuizInput, isAdmin, updateQuiz);
router.get("/:id", getSingleQuiz);
router.delete("/:id", validateQuizInput, isAdmin, deleteQuiz);

export default router;
