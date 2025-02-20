import Instructor from "../models/InstructorModel.js";
import { NotFoundError } from "../errors/customErrors.js";

export const addInstructor = async (req, res) => {
  const { instructorName, instructorRole } = req.body;
  const newInstructor = new Instructor({
    instructorName: instructorName,
    instructorRole: instructorRole,
  });
  await newInstructor.save();
  res.status(201).json({ message: "successfully created" });
};

export const getAllInstructor = async (req, res) => {
  const instructors = await Instructor.find();
  if (!instructors) throw new NotFoundError("instructor not found");
  res.status(201).json(instructors);
};

export const updateInstructor = async (req, res) => {
  const { instructorName, instructorRole } = req.body;
  const { id } = req.params;
  const instructor = await Instructor.findById(id);
  if (!instructor) throw new NotFoundError("not found error");
  instructor.instructorName = instructorName;
  instructor.instructorRole = instructorRole;
  await instructor.save();
  res.status(200).json({ message: "instructor is updated" });
};

export const getSingleInstructor = async (req, res) => {
  const { id } = req.params;
  const instructor = await Instructor.findById(id);
  if (!instructor) throw new NotFoundError("instructor not found");
  res.status(200).json(instructor);
};

export const deleteInstructor = async (req, res) => {
  const { id } = req.params;
  const instructor = await Instructor.findByIdAndDelete(id);
  if (!instructor) throw new NotFoundError("instructor not found");
  res.status(200).json({ message: "deleted successfully" });
};
