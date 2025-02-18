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
