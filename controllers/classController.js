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

// export const joinCommunity = async (req, res) => {
//   const { communityId } = req.body;
//   const userId = req.user.userId;

//   // Find the community
//   const community = await Community.findById(communityId);
//   if (!community) throw new NotFoundError("Community not found");

//   // Check if the user is already a member
//   if (community.communityMembers.includes(userId)) {
//     return res
//       .status(400)
//       .json({ message: "User already a member of this community" });
//   }

//   // Add user to the community members
//   community.communityMembers.push(userId);
//   await community.save();

//   // Find the user
//   const user = await User.findById(userId);
//   if (!user) throw new NotFoundError("User not found");

//   // Add the community ID to the user's community list
//   user.community.push(communityId);
//   await user.save();

//   res.status(200).json({ message: "Successfully joined the community" });
// };

// export const getMembersByCommunity = async (req, res) => {
//   const { id } = req.params;
//   const community = await Community.findById(id);
//   if (!community) {
//     res.status(400).json({ message: "Community not found" });
//   }
//   res.status(200).json(community.communityMembers);
// };

// export const joinClassSession = async (req, res) => {
//   console.log("Received join request:", {
//     params: req.params,
//     body: req.body,
//     headers: req.headers,
//   });

//   try {
//     // 1. Validate request
//     if (!req.params.classId) {
//       console.error("Missing classId in URL params");
//       return res.status(400).json({
//         error: "Class ID is required in URL",
//         example: "/api/v1/class/joinClass/:classId",
//       });
//     }

//     if (!req.body.userId) {
//       console.error("Missing userId in request body");
//       return res.status(400).json({
//         error: "User ID is required in request body",
//         requiredFields: { userId: "string" },
//       });
//     }

//     // 2. Fetch data
//     const [user, classSession] = await Promise.all([
//       User.findById(req.body.userId).select("_id role").lean(),
//       Class.findById(req.params.classId).select("_id").lean(),
//     ]);

//     if (!user) {
//       console.error(`User not found: ${req.body.userId}`);
//       return res.status(404).json({
//         error: "User not found",
//         providedUserId: req.body.userId,
//       });
//     }

//     if (!classSession) {
//       console.error(`Class not found: ${req.params.classId}`);
//       return res.status(404).json({
//         error: "Class not found",
//         providedClassId: req.params.classId,
//       });
//     }

//     // 3. Generate token
//     const channelName = `class-${classSession._id}`;
//     console.log("Generating token for:", {
//       channelName,
//       userId: user._id,
//       role: user.role,
//     });

//     const token = generateAgoraToken(
//       channelName,
//       user._id.toString(),
//       user.role
//     );

//     // 4. Send response
//     const responseData = {
//       token,
//       channelName,
//       uid: user._id,
//       role: user.role,
//       classId: classSession._id,
//       expiresIn: 3600,
//     };

//     console.log("Successfully generated token:", responseData);
//     res.json(responseData);
//   } catch (error) {
//     console.error("Join class error:", {
//       error: error.message,
//       stack: error.stack,
//       request: {
//         method: req.method,
//         url: req.originalUrl,
//         body: req.body,
//       },
//     });

//     res.status(500).json({
//       error: "Internal server error",
//       details: process.env.NODE_ENV === "development" ? error.message : null,
//     });
//   }
// };

//next code

// export const joinClassSession = async (req, res) => {
//   if (!req.params.classId) {
//     return res.status(400).json({
//       error: "Class ID is required in URL",
//       example: "/api/v1/class/joinClass/:classId",
//     });
//   }

//   if (!req.body.userId) {
//     return res.status(400).json({
//       error: "User ID is required in request body",
//       requiredFields: { userId: "string" },
//     });
//   }

//   const [user, classSession] = await Promise.all([
//     User.findById(req.body.userId).select("_id role").lean(),
//     Class.findById(req.params.classId).select("_id").lean(),
//   ]);

//   if (!user) {
//     return res.status(404).json({
//       error: "User not found",
//       providedUserId: req.body.userId,
//     });
//   }

//   if (!classSession) {
//     return res.status(404).json({
//       error: "Class not found",
//       providedClassId: req.params.classId,
//     });
//   }

//   const channelName = `class-${classSession._id}`;
//   const token = generateAgoraToken(channelName, user._id.toString(), user.role);

//   res.json({
//     token,
//     channelName,
//     uid: user._id,
//     role: user.role,
//     classId: classSession._id,
//     expiresIn: 3600,
//   });
// };

// code:4

export const joinClassSession = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

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
