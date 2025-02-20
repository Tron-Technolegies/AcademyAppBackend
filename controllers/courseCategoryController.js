import { NotFoundError } from "../errors/customErrors.js";
import Category from "../models/CategoryModel.js";

export const addCourseCategory = async (req, res) => {
  const { categoryName } = req.body;
  const newCategory = new Category({
    categoryName: categoryName,
  });
  await newCategory.save();
  res.status(201).json({ message: "successfully created" });
};

export const getAllCategory = async (req, res) => {
  const categories = await Category.find();
  if (!categories) throw new NotFoundError("category not found");
  res.status(200).json(categories);
};

export const updateCategory = async (req, res) => {
  const { categoryName } = req.body;
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) throw new NotFoundError("category not found");
  category.categoryName = categoryName;
  await category.save();
  res.status(200).json({ message: "category is updated" });
};
export const getSingleCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) throw new NotFoundError("category not found");
  res.status(200).json(category);
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new NotFoundError("category not found");
  res.status(200).json({ message: "successfully deleted" });
};
