import { NotFoundError } from "../errors/customErrors.js";
import Class from "../models/ClassModel.js";

export const addClass = async (req, res) => {
  const { className, date, time, instructor, course } = req.body;
  const [day, month, year] = date.split("/");
  const newClass = new Class({
    className,
    date: new Date(`${year}-${month}-${day}T00:00:00Z`),
    time,
    instructor,
    course,
  });
  await newClass.save();
  res.status(201).json({ message: "successfully created" });
};

export const getAllClass = async (req, res) => {
  const classes = await Class.find();
  if (!classes) throw new NotFoundError("classes not found");
  res.status(200).json(classes);
};

export const updateClass = async (req, res) => {
  const { className, date, time, instructor, course } = req.body;
  const { id } = req.params;
  const classes = await Class.findById(id);
  const [day, month, year] = date.split("/");
  if (!classes) throw new NotFoundError("class not found");
  classes.className = className;
  classes.date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  classes.time = time;
  classes.instructor = instructor;
  classes.course = course;
  await classes.save();
  res.status(200).json({ message: "class is updated" });
};

export const getSingleClass = async (req, res) => {
  const { id } = req.params;
  const classes = await Class.findById(id);
  if (!classes) throw new NotFoundError("classes not found");
  res.status(200).json(classes);
};

export const deleteClass = async (req, res) => {
  const { id } = req.params;
  const classes = await Class.findByIdAndDelete(id);
  if (!classes) throw new NotFoundError("classes not found");
  res.status(200).json("deleted successfully");
};
