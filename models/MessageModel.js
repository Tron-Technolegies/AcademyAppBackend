import mongoose, { model, Schema } from "mongoose";

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
      enum: ["text", "image", "voice", "audio"],
    },
  },
  { timestamps: true }
);

const Message = model("Message", MessageSchema);
export default Message;
