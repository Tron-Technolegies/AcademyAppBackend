import mongoose, { model, Schema } from "mongoose";
const quizResultSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    quiz: {
      type: mongoose.Types.ObjectId,
      ref: "Quiz",
    },
    score: {
      type: Number,
    },
    totalQuestions: {
      type: Number,
    },
    timeTaken: {
      type: Number,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
const QuizResult = model("QuizResult", quizResultSchema);
export default QuizResult;
