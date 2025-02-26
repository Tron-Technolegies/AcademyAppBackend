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
