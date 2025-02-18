import mongoose, { model, Schema } from "mongoose";

const ModuleSchema = new Schema(
  {
    moduleName: String,
    relatedCourse: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
    },
    totalVideos: {
      type: Number,
    },
    AllVideos: [
      {
        type: mongoose.Types.ObjectId, //this is mongodb id
        ref: "Video", //saved will be an array of IDs of the video model
      },
    ],
  },
  { timestamps: true }
);
const Module = model("Module", ModuleSchema);
export default Module;
