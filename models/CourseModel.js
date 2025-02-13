import mongoose, { model, Schema } from "mongoose";
const InstructorSchema = new Schema({
  name: String,
  role: String,
  rating: Number,
  students: Number,
  course: String,
  minutes: Number,
});

const CourseSchema = new Schema(
  {
    courseName: {
      type: String,
      required: true,
    },
    courseCategory: {
      type: mongoose.Types.ObjectId,
    },
    instructor: {
      type: InstructorSchema,
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
