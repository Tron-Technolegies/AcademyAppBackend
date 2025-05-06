import mongoose, { model, Schema } from "mongoose";

const commentSchema = new Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
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
    comments: [commentSchema],
  },
  { timestamps: true }
);

const Video = model("Video", VideoSchema);
export default Video;
