import mongoose, { model, Schema } from "mongoose";

const CommunitySchema = new Schema(
  {
    communityName: {
      type: String,
    },
    communityMembers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    subCommunities: {
      type: mongoose.Types.ObjectId,
      ref: "SubCommunity",
    },
  },
  { timestamps: true }
);

const Community = model("Community", CommunitySchema);

export default Community;
