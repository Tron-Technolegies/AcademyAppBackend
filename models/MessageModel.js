import mongoose, { model, Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    message: {
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
  },
  { timestamps: true }
);

const Message = model("Message", MessageSchema);
export default Message;
