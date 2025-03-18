import { NotFoundError } from "../errors/customErrors.js";
import SubCommunity from "../models/SubCommunity.js";

export const addSubCommunity = async (req, res) => {
  const { subCommunityName, relatedCommunity } = req.body;
  const newSubCommunity = new SubCommunity({
    subCommunityName: subCommunityName,
    relatedCommunity: relatedCommunity,
  });
  await newSubCommunity.save();
  res.status(201).json({ message: "successfully created" });
};

export const getAllSubCommunity = async (req, res) => {
  const subCommunity = await SubCommunity.find();
  if (!subCommunity) throw new NotFoundError("no community found");
  res.status(200).json(subCommunity);
};

export const updateSubCommunity = async (req, res) => {
  const { subCommunityName, relatedCommunity } = req.body;
  const { id } = req.params;
  const subCommunity = await SubCommunity.findById(id);
  if (!subCommunity) throw new NotFoundError("no community found");
  subCommunity.subCommunityName = subCommunityName;
  subCommunity.relatedCommunity = relatedCommunity;
  await subCommunity.save();
  res.status(200).json({ message: " sub community is updated" });
};

export const getSingleSubCommunity = async (req, res) => {
  const { id } = req.params;
  const subCommunity = await SubCommunity.findById(id);
  if (!subCommunity) throw new NotFoundError("no community found");
  res.status(200).json(subCommunity);
};

export const deleteSubCommunity = async (req, res) => {
  const { id } = req.params;
  const subCommunity = await SubCommunity.findByIdAndDelete(id);
  if (!subCommunity) throw new NotFoundError("no community found");
  res.status(200).json("deleted successfully");
};

export const getSubCommunityByCommunity = async (req, res) => {
  const { id } = req.query;
  const subCommunity = await SubCommunity.find({
    relatedCommunity: id,
  });
  if (!subCommunity) throw new NotFoundError("community not found");
  res.status(200).json(subCommunity);
};
