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
    subCommunity: {
      type: mongoose.Types.ObjectId,
      ref: "SubCommunity",
    },
    community: {
      type: mongoose.Types.ObjectId,
      ref: "Community",
    },
  },
  { timestamps: true }
);

const Message = model("Message", MessageSchema);
export default Message;
