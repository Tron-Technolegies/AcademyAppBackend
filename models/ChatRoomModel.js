import mongoose, { model, Schema } from "mongoose";

const ChatRoomSchema = new Schema(
  {
    chatRoomName: {
      type: String,
    },
    relatedCommunity: {
      type: mongoose.Types.ObjectId,
      ref: "Community",
    },
    relatedSubCommunity: {
      type: mongoose.Types.ObjectId,
      ref: "SubCommunity",
    },
    chatRoomMembers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    chatRoomMessages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

const ChatRoom = model("ChatRoom", ChatRoomSchema);
export default ChatRoom;
