import { NotFoundError } from "../errors/customErrors.js";
import Community from "../models/CommunityModel.js";

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
