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
  const { search = "" } = req.query;
  const filter = search ? { name: { $regex: search, $options: "i" } } : {};
  const quiz = await Quiz.find(filter)
    .populate("relatedCourse", "courseName")
    .populate("relatedModule", "moduleName")
    .populate("courseCategory", "categoryName");
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
  const quiz = await Quiz.findById(id)
    .populate("relatedCourse")
    .populate("relatedModule")
    .populate("courseCategory");
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

  // Check if user already attempted this quiz
  const alreadySubmitted = await QuizResult.findOne({
    user: userId,
    quiz: quizId,
  });
  if (alreadySubmitted) {
    return res.status(400).json({
      message:
        "You have already submitted this quiz. Only one attempt is allowed.",
    });
  }

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
  const { courseId } = req.query;
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

export const checkQuizSubmission = async (req, res) => {
  const { quizId } = req.query;
  const userId = req.user.userId;

  const quizResult = await QuizResult.findOne({
    user: userId,
    quiz: quizId,
  });

  res.status(200).json({
    hasSubmitted: !!quizResult,
    message: quizResult ? "Quiz already submitted" : "Quiz not yet submitted",
  });
};

export const getCourseLeaderboard = async (req, res) => {
  const { courseId } = req.query;

  // Step 1: Find all quizzes for the course
  const quizzes = await Quiz.find({ relatedCourse: courseId });
  if (!quizzes.length)
    throw new NotFoundError("No quizzes found for this course");

  const quizIds = quizzes.map((quiz) => quiz._id);

  // Step 2: Get all results for those quizzes
  const results = await QuizResult.find({ quiz: { $in: quizIds } }).populate(
    "user",
    "firstName lastName profilePicUrl"
  );

  if (!results.length) {
    return res.status(404).json({ message: "No quiz results for this course" });
  }

  // Step 3: Aggregate scores and timeTaken by user
  const userScores = {};
  results.forEach((result) => {
    const userId = result.user._id.toString();
    if (!userScores[userId]) {
      userScores[userId] = {
        user: result.user,
        totalScore: 0,
        totalQuestions: 0,
        totalTimeTaken: 0,
        attempts: 0,
      };
    }
    userScores[userId].totalScore += result.score;
    userScores[userId].totalQuestions += result.totalQuestions;
    userScores[userId].totalTimeTaken += result.timeTaken;
    userScores[userId].attempts += 1;
  });

  // Step 4: Calculate weighted score and prepare leaderboard array
  let leaderboard = Object.values(userScores).map((entry) => {
    const accuracy =
      entry.totalQuestions > 0 ? entry.totalScore / entry.totalQuestions : 0;
    const weightedScore = accuracy * Math.log(entry.totalQuestions + 1);
    const avgTimeTaken =
      entry.attempts > 0 ? entry.totalTimeTaken / entry.attempts : 0;

    return {
      user: entry.user,
      score: entry.totalScore,
      total: entry.totalQuestions,
      accuracy: (accuracy * 100).toFixed(2),
      avgTimeTaken: avgTimeTaken.toFixed(2),
      weightedScore,
    };
  });

  // Step 5: Sort leaderboard by weightedScore
  leaderboard.sort((a, b) => b.weightedScore - a.weightedScore);

  // Step 6: Assign rank and clean up
  leaderboard = leaderboard.map(({ weightedScore, ...entry }, index) => ({
    ...entry,
    rank: index + 1,
  }));

  // Step 7: Separate top 3
  const top3 = leaderboard.slice(0, 3);

  // Step 8: Send both top3 and full leaderboard
  res.status(200).json({
    courseId,
    top3,
    leaderboard, // full list, includes top 3
  });
};

export const getQuizzesByModuleStatus = async (req, res) => {
  const userId = req.user.userId;
  const { moduleId } = req.query;

  if (!moduleId)
    return res.status(400).json({ message: "moduleId is required" });

  // Fetch all quizzes for the given module
  const allQuizzes = await Quiz.find({ relatedModule: moduleId })
    .populate("relatedCourse", "courseName")
    .populate("relatedModule", "moduleName")
    .populate("courseCategory", "categoryName");

  if (!allQuizzes) throw new NotFoundError("No quizzes found for this module");

  // Fetch quiz results for the user in this module
  const completedResults = await QuizResult.find({ user: userId }).populate({
    path: "quiz",
    match: { relatedModule: moduleId },
  });

  // Filter out quiz results with no quiz (null due to mismatch in match)
  const filteredResults = completedResults.filter(
    (result) => result.quiz !== null
  );

  // Extract quiz IDs from completed results
  const completedQuizIds = filteredResults.map((result) =>
    result.quiz._id.toString()
  );

  // Separate completed and uncompleted quizzes
  const completedQuizzes = filteredResults.map((result) => {
    return {
      quiz: result.quiz,
      score: result.score,
      totalQuestions: result.totalQuestions,
      timeTaken: result.timeTaken,
      resultId: result._id,
    };
  });

  const incompleteQuizzes = allQuizzes.filter(
    (quiz) => !completedQuizIds.includes(quiz._id.toString())
  );

  res.status(200).json({
    completedQuizzes,
    incompleteQuizzes,
  });
};

// export const getLeaderboard = async (req, res) => {
//   // Step 1: Fetch all quizzes
//   const quizzes = await Quiz.find({});
//   if (!quizzes) return res.status(404).json({ message: "No quizzes found" });

//   const quizIds = quizzes.map((quiz) => quiz._id);

//   // Step 2: Get all quiz results, populate user data including profilePicUrl
//   const results = await QuizResult.find({ quiz: { $in: quizIds } }).populate(
//     "user",
//     "firstName lastName profilePicUrl"
//   );

//   if (!results)
//     return res.status(404).json({ message: "No quiz results found" });

//   // Step 3: Aggregate scores, questions, and time by user
//   const userScores = {};
//   results.forEach((result) => {
//     const userId = result.user._id.toString();
//     if (!userScores[userId]) {
//       userScores[userId] = {
//         user: result.user,
//         totalScore: 0,
//         totalQuestions: 0,
//         totalTimeTaken: 0,
//         attempts: 0,
//       };
//     }
//     userScores[userId].totalScore += result.score;
//     userScores[userId].totalQuestions += result.totalQuestions;
//     userScores[userId].totalTimeTaken += result.timeTaken || 0;
//     userScores[userId].attempts += 1;
//   });

//   // Step 4: Prepare leaderboard array
//   const leaderboard = Object.values(userScores).map((entry) => {
//     const accuracy =
//       entry.totalQuestions > 0 ? entry.totalScore / entry.totalQuestions : 0;
//     const weightedScore = accuracy * Math.log(entry.totalQuestions + 1);
//     const averageTime =
//       entry.attempts > 0 ? entry.totalTimeTaken / entry.attempts : 0;

//     return {
//       user: entry.user,
//       score: entry.totalScore,
//       total: entry.totalQuestions,
//       weightedScore,
//       accuracy: (accuracy * 100).toFixed(2),
//       averageTime: averageTime.toFixed(2),
//     };
//   });

//   // Step 5: Sort by weighted score, then average time
//   leaderboard.sort((a, b) => {
//     if (b.weightedScore === a.weightedScore) {
//       return a.averageTime - b.averageTime;
//     }
//     return b.weightedScore - a.weightedScore;
//   });

//   // Step 6: Assign ranks
//   leaderboard.forEach((entry, index) => {
//     entry.rank = index + 1;
//   });

//   // Step 7: Get top 3 users
//   const top3 = leaderboard.slice(0, 3);

//   // Step 8: Clean final leaderboard (omit weightedScore)
//   const cleanLeaderboard = leaderboard.map(
//     ({ weightedScore, ...rest }) => rest
//   );

//   res.status(200).json({ top3, leaderboard: cleanLeaderboard });
// };

export const getLeaderboard = async (req, res) => {
  const quizzes = await Quiz.find({});
  if (!quizzes.length)
    return res.status(404).json({ message: "No quizzes found" });

  const quizIds = quizzes.map((quiz) => quiz._id);

  const results = await QuizResult.find({
    quiz: { $in: quizIds },
  }).populate("user", "firstName lastName profilePicUrl");

  if (!results.length)
    return res.status(404).json({ message: "No quiz results found" });

  const now = new Date();

  // Start of Day
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Start of Week (Monday)
  const weekStart = new Date(now);
  const day = weekStart.getDay(); // Sunday = 0, Monday = 1...
  const diffToMonday = (day + 6) % 7;
  weekStart.setDate(now.getDate() - diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  // Start of Month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const daily = generateScopedLeaderboard(
    results.filter((r) => r.createdAt >= dayStart)
  );
  const weekly = generateScopedLeaderboard(
    results.filter((r) => r.createdAt >= weekStart)
  );
  const monthly = generateScopedLeaderboard(
    results.filter((r) => r.createdAt >= monthStart)
  );

  res.status(200).json({
    daily: {
      top3: daily.slice(0, 3),
      leaderboard: daily,
    },
    weekly: {
      top3: weekly.slice(0, 3),
      leaderboard: weekly,
    },
    monthly: {
      top3: monthly.slice(0, 3),
      leaderboard: monthly,
    },
  });
};

const generateScopedLeaderboard = (results) => {
  const userScores = {};

  results.forEach((result) => {
    const userId = result.user._id.toString();
    if (!userScores[userId]) {
      userScores[userId] = {
        user: result.user,
        totalScore: 0,
        totalQuestions: 0,
        totalTimeTaken: 0,
        attempts: 0,
      };
    }
    userScores[userId].totalScore += result.score;
    userScores[userId].totalQuestions += result.totalQuestions;
    userScores[userId].totalTimeTaken += result.timeTaken || 0;
    userScores[userId].attempts += 1;
  });

  let leaderboard = Object.values(userScores).map((entry) => {
    const accuracy =
      entry.totalQuestions > 0 ? entry.totalScore / entry.totalQuestions : 0;
    const weightedScore = accuracy * Math.log(entry.totalQuestions + 1);
    const averageTime =
      entry.attempts > 0 ? entry.totalTimeTaken / entry.attempts : 0;

    return {
      user: entry.user,
      score: entry.totalScore,
      total: entry.totalQuestions,
      accuracy: (accuracy * 100).toFixed(2),
      averageTime: averageTime.toFixed(2),
      weightedScore,
    };
  });

  leaderboard.sort((a, b) => {
    if (b.weightedScore === a.weightedScore) {
      return a.averageTime - b.averageTime;
    }
    return b.weightedScore - a.weightedScore;
  });

  return leaderboard.map((entry, index) => {
    const { weightedScore, ...rest } = entry;
    return {
      ...rest,
      rank: index + 1,
    };
  });
};
