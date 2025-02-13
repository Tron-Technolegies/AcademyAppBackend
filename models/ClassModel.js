import mongoose, { model, Schema } from "mongoose";
import Course from "./CourseModel";

const ClassSchema = new Schema(
  {
    className: {
      type: String,
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    instructor: {
      type: String,
    },
    course: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
    },
  },
  { timestamps: true }
);

const Class = model("Class", ClassSchema);
export default Class;
