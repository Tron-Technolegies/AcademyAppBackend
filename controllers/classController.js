import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;

import { NotFoundError } from "../errors/customErrors.js";
import Class from "../models/ClassModel.js";
import User from "../models/UserModel.js";
import generateAgoraToken from "../utils/agora/agoraToken.js";

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

// export const joinClassSession = async (req, res) => {
//   const classId = req.params.id;
//   const { userId } = req.body;

//   const user = await User.findById(userId);

//   if (!user) {
//     return res.status(404).json({ error: "User not found" });
//   }

//   const classSession = await Class.findById(classId);

//   if (!classSession) {
//     return res.status(404).json({ error: "Class not found" });
//   }

//   const channelName = `class-${classSession._id}`;
//   console.log("Generated channel name:", channelName);

//   // Assign role based on the user's role (instructor = PUBLISHER, student = SUBSCRIBER)
//   const role =
//     user.role === "instructor" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
//   console.log("Assigned role:", role);

//   // Generate Agora token using the user._id and class channel name
//   const token = generateAgoraToken(channelName, user._id); // Pass user._id here
//   console.log("Generated Agora token:", token);

//   // Return the token and channel name to the frontend
//   res.json({ token, channelName });
// };

export const joinClassSession = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!userId) {
    return res.status(400).json({
      error: "User ID is required in request body",
      requiredFields: { userId: "string" },
    });
  }

  const [user, classSession] = await Promise.all([
    User.findById(userId).select("_id role").lean(),
    Class.findById(id).select("_id").lean(),
  ]);

  if (!user) throw new NotFoundError("User not found");
  if (!classSession) throw new NotFoundError("Class not found");

  const channelName = `class-${classSession._id}`;
  const token = generateAgoraToken(channelName, user._id.toString(), user.role);

  res.status(200).json({
    token,
    channelName,
    uid: user._id,
    role: user.role,
    classId: classSession._id,
    expiresIn: 3600,
  });
};
