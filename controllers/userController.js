import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import { formatImage } from "../middleware/multerMiddleware.js";
import User from "../models/UserModel.js";
import { v2 as cloudinary } from "cloudinary";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { response } from "express";

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
  const user = await User.findById(req.user.userId)
    .populate(["saved", "history"])
    .select("-password");
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

export const saveVideo = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("user not found");
  user.saved.push(req.body.id);
  await user.save();
  res.status(200).json({ message: "successfully saved" });
};

export const unSaveVideo = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("user not found");
  const allVideos = user.saved;
  const newVideos = allVideos.filter((video) => {
    return video.toString() !== req.body.id.toString();
  });
  user.saved = newVideos;
  await user.save();
  res.status(200).json({ message: "unsaved successfully" });
};

export const addToHistory = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("user not found");
  const allVideos = user.history; //here history is an array that created in user model
  const newVideos = allVideos.filter((video) => {
    //to check video(id) not equal to  videos(id) in the history.
    return video.toString() !== req.body.id.toString();
  });
  user.history = newVideos;
  user.history.push(req.body.id);
  await user.save();
  res.status(200).json({ message: "successfully added" });
};

export const clearHistory = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("user not found");
  user.history = [];
  await user.save();
  res.status(200).json({ message: "successfully cleared" });
};

export const removeFromHistory = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("user not found");
  const allVideos = user.history;
  const newVideos = allVideos.filter((video) => {
    return video.toString() !== req.body.id.toString();
  });
  user.history = newVideos;
  await user.save();
  res.status(200).json({ message: "deleted successfully" });
};

export const updatePassword = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("user not found");
  const { currentPassword, newPassword } = req.body;
  const isMatch = await comparePassword(currentPassword, user.password);

  if (isMatch) {
    const newHashedPassword = await hashPassword(newPassword);
    user.password = newHashedPassword;
    await user.save();
    res.status(200).json({ message: "password updated successfully" });
  } else {
    res.status(400).json({ message: "invalid current password" });
  }
};

export const getAllSavedVideo = async (req, res) => {
  const user = await User.findById(req.user.userId).populate("saved");
  if (!user) throw new NotFoundError("user not found");
  res.status(200).json(user.saved);
};

export const getAllHistory = async (req, res) => {
  const user = await User.findById(req.user.userId).populate("history");
  if (!user) throw new NotFoundError("user not found");
  res.status(200).json(user.history);
};

export const managePlan = async (req, res) => {
  const { planType } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("No user found");
  user.subscriptionType = planType;
  if (planType === "free-trial") {
    const startDate = new Date();
    user.freeTrialStart = startDate;
    user.freeTrialEnd = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  await user.save();
  res.status(200).json({ msg: "success" });
};

export const getAllUser = async (req, res) => {
  const { search } = req.query;
  const query = { role: "student" };

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phoneNumber: { $regex: search, $options: "i" } },
    ];
  }
  const students = await User.find(query).select("-password");
  if (!students) throw new NotFoundError("students not found");
  res.status(200).json(students);
};
