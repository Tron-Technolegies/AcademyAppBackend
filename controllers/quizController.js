import { NotFoundError } from "../errors/customErrors.js";
import Quiz from "../models/QuizModel.js";
import QuizResult from "../models/QuizResultModel.js";

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

export const calculateQuizScore = async (req, res) => {
  const { id } = req.params; //quiz id
  const { userAnswers } = req.body;

  const quiz = await Quiz.findById(id);
  if (!quiz) throw new NotFoundError("Quiz not found");

  let correctAnswers = 0;

  userAnswers.forEach(({ questionId, answer }) => {
    const question = quiz.questions.find(
      (q) => q._id.toString() === questionId
    );
    if (question && question.answer === answer) {
      correctAnswers++;
    }
  });

  const totalQuestions = quiz.questions.length;
  const scorePercentage = (correctAnswers / totalQuestions) * 100;

  res.status(200).json({ correctAnswers, totalQuestions, scorePercentage });
};

export const submitQuizResult = async (req, res) => {
  const { quizId, userAnswers, timeTaken } = req.body;
  const userId = req.user.userId;

  // Fetch quiz with correct answers
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new NotFoundError("Quiz not found");

  let correctAnswers = 0;
  const totalQuestions = quiz.questions.length;

  // Compare answers
  userAnswers.forEach(({ questionId, answer }) => {
    const question = quiz.questions.find(
      (q) => q._id.toString() === questionId
    );
    if (question && question.answer === answer) {
      correctAnswers++;
    }
  });

  // Save the quiz result
  const newQuizResult = new QuizResult({
    user: userId,
    quiz: quizId,
    score: correctAnswers,
    totalQuestions,
    timeTaken,
  });

  await newQuizResult.save();
  res.status(201).json({
    message: "Quiz submitted successfully",
    score: correctAnswers,
    totalQuestions,
    resultId: newQuizResult._id,
  });
};

export const calculateCourseScore = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.userId;

  // Find all quizzes related to the course (includes all modules)
  const quizzes = await Quiz.find({ relatedCourse: courseId });
  if (!quizzes.length) {
    throw new NotFoundError("No quizzes found for this course");
  }

  // Get all quiz IDs from the course's quizzes
  const quizIds = quizzes.map((q) => q._id);

  // Find all quiz results of this user for those quizzes
  const quizResults = await QuizResult.find({
    user: userId,
    quiz: { $in: quizIds },
  });

  let totalCorrectAnswers = 0;
  let totalQuestionsAttempted = 0;

  // Sum up correct answers and total questions attempted for all quizzes
  quizResults.forEach((result) => {
    totalCorrectAnswers += result.score;
    totalQuestionsAttempted += result.totalQuestions;
  });

  // Calculate overall percentage score for the course
  const overallScorePercentage =
    totalQuestionsAttempted > 0
      ? (totalCorrectAnswers / totalQuestionsAttempted) * 100
      : 0;

  res.status(200).json({
    courseId,
    totalCorrectAnswers,
    totalQuestionsAttempted,
    overallScorePercentage,
  });
};
// export const getQuizResults = async (req, res) => {
//   const userId = req.user.userId;

//   const results = await QuizResult.find({ user: userId }).populate("quiz");

//   if (!results.length) {
//     return res.status(404).json({ message: "No quiz results found" });
//   }

//   res.status(200).json(results);
// };
