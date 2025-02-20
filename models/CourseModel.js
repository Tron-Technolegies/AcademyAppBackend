import mongoose, { model, Schema } from "mongoose";

const CourseSchema = new Schema(
  {
    courseName: {
      type: String,
      required: true,
    },
    courseCategory: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
    instructor: {
      type: mongoose.Types.ObjectId,
      ref: "Instructor",
    },
    courseRating: {
      type: Number,
    },
    totalTime: {
      type: Number,
    },
    totalModules: {
      type: Number,
    },
    totalVideos: {
      type: Number,
    },
    courseOverView: {
      type: String,
    },
  },
  { timestamps: true }
);

const Course = model("Course", CourseSchema);
export default Course;
