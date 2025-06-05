import { NotFoundError } from "../errors/customErrors.js";
import Quiz from "../models/QuizModel.js";

export const addQuiz = async (req, res) => {
  const {
    name,
    time,
    courseCategory,
    relatedCourse,
    relatedModule,
    questions,
  } = req.body;

  const newQuiz = new Quiz({
    name,
    time,
    courseCategory,
    relatedCourse,
    relatedModule,
    questions,
  });

  await newQuiz.save();
  res.status(201).json({ message: "Successfully created" });
};

export const getAllQuiz = async (req, res) => {
  const quiz = await Quiz.find();
  if (!quiz) throw new NotFoundError("Quiz not found");
  res.status(200).json(quiz);
};

export const updateQuiz = async (req, res) => {
  const {
    name,
    time,
    courseCategory,
    relatedCourse,
    relatedModule,
    questions,
  } = req.body;
  const { id } = req.params;
  const quiz = await Quiz.findById(id);
  if (!quiz) throw new NotFoundError("Quiz not found");

  quiz.name = name;
  quiz.time = time;
  quiz.courseCategory = courseCategory;
  quiz.relatedCourse = relatedCourse;
  quiz.relatedModule = relatedModule;
  quiz.questions = questions;

  await quiz.save();
  res.status(200).json({ message: "Quiz updated successfully" });
};

export const getSingleQuiz = async (req, res) => {
  const { id } = req.params;
  const quiz = await Quiz.findById(id);
  if (!quiz) throw new NotFoundError("quizzes not found");
  res.status(200).json(quiz);
};

export const deleteQuiz = async (req, res) => {
  const { id } = req.params;
  const quiz = await Quiz.findByIdAndDelete(id);
  if (!quiz) throw new NotFoundError("no quiz found");
  res.status(200).json({ message: "quiz deleted successfully" });
};

export const getQuizByCourse = async (req, res) => {
  const { courseId } = req.query;
  const quizzes = await Quiz.find({ relatedCourse: courseId });
  if (!quizzes) throw new NotFoundError("quiz not found");
  res.status(200).json(quizzes);
};

export const getQuizByModule = async (req, res) => {
  const { moduleId } = req.query;
  const quizzes = await Quiz.find({ relatedModule: moduleId });
  if (!quizzes) throw new NotFoundError("quiz not found");
  res.status(200).json(quizzes);
};
