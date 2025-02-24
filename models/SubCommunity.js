import mongoose, { model, Schema } from "mongoose";

const SubCommunitySchema = new Schema(
  {
    subCommunityName: {
      type: String,
    },
    relatedCommunity: {
      type: mongoose.Types.ObjectId,
      ref: "Community",
    },
    subCommunityMembers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const SubCommunity = model("SubCommunity", SubCommunitySchema);
export default SubCommunity;
