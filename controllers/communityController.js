import { NotFoundError } from "../errors/customErrors.js";
import Community from "../models/CommunityModel.js";
import User from "../models/UserModel.js";

export const addCommunity = async (req, res) => {
  const { communityName } = req.body;
  const newCommunity = new Community({
    communityName: communityName,
  });
  await newCommunity.save();
  res.status(201).json({ message: "successfully created" });
};

export const getAllCommunity = async (req, res) => {
  const communities = await Community.find();
  if (!communities) throw new NotFoundError("community not found");
  res.status(200).json(communities);
};

export const updateCommunity = async (req, res) => {
  const { communityName } = req.body;
  const { id } = req.params;
  const community = await Community.findById(id);
  if (!community) throw new NotFoundError("community not found");
  community.communityName = communityName;
  await community.save();
  res.status(200).json({ message: "community is updated" });
};

export const getSingleCommunity = async (req, res) => {
  const { id } = req.params;
  const communities = await Community.findById(id);
  if (!communities) throw new NotFoundError("community not found");
  res.status(200).json(communities);
};

export const deleteCommunity = async (req, res) => {
  const { id } = req.params;
  const community = await Community.findByIdAndDelete(id);
  if (!community) throw new NotFoundError("community not found");
  res.status(200).json({ message: "successfully deleted" });
};

export const joinCommunity = async (req, res) => {
  const { communityId } = req.body;
  const userId = req.user.userId;

  // Find the community
  const community = await Community.findById(communityId);
  if (!community) throw new NotFoundError("Community not found");

  // Check if the user is already a member
  if (community.communityMembers.includes(userId)) {
    return res
      .status(400)
      .json({ message: "User already a member of this community" });
  }

  // Add user to the community members
  community.communityMembers.push(userId);
  await community.save();

  // Find the user
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  // Add the community ID to the user's community list
  user.community.push(communityId);
  await user.save();

  res.status(200).json({ message: "Successfully joined the community" });
};

export const getMembersByCommunity = async (req, res) => {
  const { id } = req.params;
  const community = await Community.findById(id);
  if (!community) {
    res.status(400).json({ message: "Community not found" });
  }
  res.status(200).json(community.communityMembers);
};
