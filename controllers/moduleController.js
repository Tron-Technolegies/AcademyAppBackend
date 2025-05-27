import { NotFoundError } from "../errors/customErrors.js";
import Module from "../models/ModuleModel.js";

export const addModule = async (req, res) => {
  const { moduleName, relatedCourse } = req.body;
  const newModule = new Module({
    moduleName: moduleName,
    relatedCourse: relatedCourse,
  });
  await newModule.save();
  res.status(201).json({ message: "successfully created" });
};

export const getAllModule = async (req, res) => {
  const { search } = req.query;

  const queryObject = {};
  if (search && search.trim() !== "") {
    queryObject.moduleName = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  const modules = await Module.find(queryObject).populate({
    path: "relatedCourse",
    populate: { path: "courseCategory" },
  });

  if (!modules) throw new NotFoundError("modules not found");
  res.status(200).json(modules);
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

export const getSingleModule = async (req, res) => {
  const { id } = req.params;
  const module = await Module.findById(id).populate({
    path: "relatedCourse",
    populate: { path: "courseCategory" },
  });
  if (!module) throw new NotFoundError("module not found");
  res.status(200).json(module);
};

export const deleteModule = async (req, res) => {
  const { id } = req.params;
  const module = await Module.findByIdAndDelete(id);
  if (!module) throw new NotFoundError("module not found");
  res.status(200).json({ message: " module is  deleted" });
};

export const getModuleByCourse = async (req, res) => {
  const { courseId } = req.query;

  // Find modules related to the given courseId
  const modules = await Module.find({ relatedCourse: courseId });

  if (!modules || modules.length === 0) {
    throw new NotFoundError("Module not found");
  }

  res.status(200).json(modules);
};
