import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import { formatImage } from "../middleware/multerMiddleware.js";
import User from "../models/UserModel.js";
import { v2 as cloudinary } from "cloudinary";

export const addUserDetails = async (req, res) => {
  const { firstName, lastName, dateOfBirth, role, gender, address } = req.body;
  const [day, month, year] = dateOfBirth.split("/");
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("User not found");
  user.firstName = firstName;
  user.lastName = lastName;
  user.dateOfBirth = new Date(`${year}-${month}-${day}T00:00:00Z`);
  user.status = role;
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

export const updateProfilePic = async (req, res) => {
  //code for updating profile pic
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("user not found");
  if (req.file) {
    const file = formatImage(req.file); //extracting the buffer file into image
    if (user.profilePicPublicId) {
      await cloudinary.uploader.destroy(user.profilePicPublicId); //deleting current profile pic
    }
    const response = await cloudinary.uploader.upload(file);
    user.profilePicUrl = response.secure_url; //storing the new url from cloudinary into the users data base
    user.profilePicPublicId = response.public_id; //storing the new public id from cloudinary into the user database
    await user.save();
    res
      .status(200)
      .json({ message: "successfully updated", url: user.profilePicUrl });
  } else throw new BadRequestError("no files found");
};
