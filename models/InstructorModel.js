import mongoose, { model, Schema } from "mongoose";

const InstructorSchema = new Schema({
  instructorName: String,
  instructorRole: String,
  instructorRating: Number,
  noOfStudents: Number,
  course: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Course",
    },
  ],
  minutes: Number,
});

const Instructor = model("Instructor", InstructorSchema);
export default Instructor;
