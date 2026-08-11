import mongoose, { model, Schema } from "mongoose";

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    course: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
    },
    notes: {
      type: String,
    },
    sessionStatus: {
      type: String,
      enum: ["scheduled", "live", "ended"],
      default: "scheduled",
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Class = model("Class", ClassSchema);
export default Class;
