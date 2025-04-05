import mongoose, { model, Schema } from "mongoose";
import { type } from "os";

const MessageSchema = new Schema(
  {
    message: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    audioUrl: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    duration: {
      type: String,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    subCommunityId: {
      type: mongoose.Types.ObjectId,
      ref: "SubCommunity",
    },
    type: {
      type: String,
      enum: ["text", "image", "voice", "audio", "file"],
    },
  },
  { timestamps: true }
);

const Message = model("Message", MessageSchema);
export default Message;
