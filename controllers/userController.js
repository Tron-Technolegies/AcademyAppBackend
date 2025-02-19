import { NotFoundError } from "../errors/customErrors.js";
import User from "../models/UserModel.js";

export const addUserDetails = async (req, res) => {
  const { firstName, lastName, dateOfBirth, role, gender, address } = req.body;
  const [day, month, year] = dateOfBirth.split("/");
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("User not found");
  user.firstName = firstName;
  user.lastName = lastName;
  user.dateOfBirth = new Date(`${year}-${month}-${day}T00:00:00Z`);
  user.role = role;
  user.gender = gender;

  user.address = address;
  await user.save();
  res.status(200).json({ message: "successfully added details" });
};

export const getUserInfo = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) throw new NotFoundError("user not found");
  res.status(200).json({ user });
};

export const updateUserDetails = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    gender,
    dateOfBirth,
    address,
  } = req.body;

  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("user not found");
  const [day, month, year] = dateOfBirth.split("/");
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.phoneNumber = phoneNumber;
  user.gender = gender;
  user.dateOfBirth = new Date(`${year}-${month}-${day}T00:00:00Z`);
  user.address = address;
  await user.save();
  res.status(200).json({ message: "successfully updated" });
};
