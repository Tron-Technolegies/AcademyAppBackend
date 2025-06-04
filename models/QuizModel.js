import mongoose, { model, Schema } from "mongoose";

const questionSchema = new Schema({
  question: {
    type: String,
  },
  options: [
    {
      type: String,
    },
  ],
  answer: {
    type: String,
  },
});

const quizSchema = new Schema(
  {
    name: {
      type: String,
    },
    time: {
      type: Number,
    },
    courseCategory: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
    relatedCourse: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
    },
    relatedModule: {
      type: mongoose.Types.ObjectId,
      ref: "Module",
    },
    questions: [questionSchema],
  },
  { timestamps: true }
);
const Quiz = model("Quiz", quizSchema);
export default Quiz;
