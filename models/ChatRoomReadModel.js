import mongoose, { model, Schema } from "mongoose";
const ChatRoomReadSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    lastReadMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastReadAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true },
);

ChatRoomReadSchema.index({ userId: 1, chatRoomId: 1 }, { unique: true });
const ChatRoomRead = model("ChatRoomRead", ChatRoomReadSchema);
export default ChatRoomRead;
