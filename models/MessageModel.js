import mongoose, { model, Schema } from "mongoose";
import { type } from "os";
import ChatRoom from "./ChatRoomModel.js";

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
    fileName: {
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
    chatRoomId: {
      type: mongoose.Types.ObjectId,
      ref: ChatRoom,
    },
  },
  { timestamps: true }
);

const Message = model("Message", MessageSchema);
export default Message;
