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

export const updateModule = async (req, res) => {
  const { moduleName, relatedCourse } = req.body;
  const { id } = req.params;
  const module = await Module.findById(id);
  if (!module) throw new NotFoundError("module not found");
  module.moduleName = moduleName;
  module.relatedCourse = relatedCourse;
  await module.save();
  res.status(200).json({ message: " module is updated" });
};

export const getSingleSubCommunity = async (req, res) => {
  const { id } = req.params;
  const subCommunity = await SubCommunity.findById(id);
  if (!subCommunity) throw new NotFoundError("no community found");
  res.status(200).json(subCommunity);
};
