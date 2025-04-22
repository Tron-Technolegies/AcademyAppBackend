import mongoose, { model, Schema } from "mongoose";

const VideoSchema = new Schema(
  {
    videoName: {
      type: String,
      required: true,
    },

    videoURL: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
    },

    relatedModule: {
      type: mongoose.Types.ObjectId,
      ref: "Module",
    },
    relatedCourse: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
    },
  },
  { timestamps: true }
);

const Video = model("Video", VideoSchema);
export default Video;
