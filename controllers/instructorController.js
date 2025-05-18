import Instructor from "../models/InstructorModel.js";
import { NotFoundError } from "../errors/customErrors.js";
import User from "../models/UserModel.js";
import { hashPassword } from "../utils/bcrypt.js";

export const addInstructor = async (req, res) => {
  const { fullName, email, password, phoneNumber, gender, designation } =
    req.body;
  const hashedPassword = await hashPassword(password);
  const newUser = new User({
    email: email,
    password: hashedPassword,
    phoneNumber: phoneNumber,
    gender: gender,
    role: "teacher",
    instructorDetails: {
      instructorName: fullName,
      instructorRole: designation,
    },
  });
  await newUser.save();
  res.status(201).json({ message: "successfully created" });
};

export const getAllInstructor = async (req, res) => {
  const { search } = req.query;
  const query = { role: "teacher" };

  if (search) {
    query.$or = [
      { "instructorDetails.instructorName": { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const instructors = await User.find(query).select("-password");
  if (!instructors) throw new NotFoundError("instructor not found");
  res.status(201).json(instructors);
};

export const updateInstructor = async (req, res) => {
  const { fullName, email, password, phoneNumber, gender, designation } =
    req.body;
  const { id } = req.params;
  const instructor = await User.findById(id);
  if (!instructor) throw new NotFoundError("instructor not found");
  instructor.instructorDetails[0].instructorName = fullName;
  instructor.instructorDetails[0].instructorRole = designation;
  instructor.email = email;
  instructor.phoneNumber = phoneNumber;
  instructor.gender = gender;
  instructor.password = await hashPassword(password);
  await instructor.save();
  res.status(200).json({ message: "Instructor updated successfully" });
};

export const getSingleInstructor = async (req, res) => {
  const { id } = req.params;
  const instructor = await User.findById(id).select("-password");
  if (!instructor) throw new NotFoundError("instructor not found");
  res.status(200).json(instructor);
};

export const deleteInstructor = async (req, res) => {
  const { id } = req.params;
  const instructor = await User.findByIdAndDelete(id);
  if (!instructor) throw new NotFoundError("instructor not found");
  res.status(200).json({ message: "deleted successfully" });
};
