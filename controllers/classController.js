import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;

import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/customErrors.js";
import Class from "../models/ClassModel.js";
import User from "../models/UserModel.js";
import generateAgoraToken, { uidHash } from "../utils/agora/agoraToken.js";

export const addClass = async (req, res) => {
  const { className, date, time, instructor, course, notes } = req.body;
  const [day, month, year] = date.split("/");
  const newClass = new Class({
    className,
    date: new Date(date),
    time,
    instructor,
    course,
    notes: notes || "",
  });
  await newClass.save();
  res.status(201).json({ message: "successfully created" });
};

export const getAllClass = async (req, res) => {
  const classes = await Class.find();
  if (!classes) throw new NotFoundError("classes not found");
  res.status(200).json(classes);
};

export const getClassByInstructor = async (req, res) => {
  const { currentPage, search } = req.query;
  try {
    const page = Number(currentPage) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const queryObject = { instructor: req.user.userId };
    if (search && search.trim() !== "") {
      queryObject.className = { $regex: search, $options: "i" };
    }
    const classes = await Class.find(queryObject)
      .populate("course", "courseName")
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);
    const totalClasses = await Class.countDocuments(queryObject);
    res.status(200).json({
      classes,
      totalClasses,
      totalPages: Math.ceil(totalClasses / limit),
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.msg || error.message });
  }
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

export const startClassSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const classSession = await Class.findById(id);
    if (!classSession) throw new NotFoundError("Class Not found");

    if (classSession.instructor.toString() !== userId) {
      throw new UnauthorizedError(
        "Only the Assigned instructor can start this class",
      );
    }

    classSession.sessionStatus = "live";
    classSession.startedAt = new Date();
    await classSession.save();
    res.status(200).json({ message: "class started" });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.msg || error.message });
  }
};

export const endClassSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const classSession = await Class.findById(id);
    if (!classSession) throw new NotFoundError("Class Not found");

    if (classSession.instructor.toString() !== userId) {
      throw new UnauthorizedError("Only assigned instructor can end the class");
    }
    classSession.sessionStatus = "ended";
    classSession.endedAt = new Date();
    await classSession.save();
    res.status(200).json({ message: "session ended" });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.msg || error.message });
  }
};

export const joinClassSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const [user, classSession] = await Promise.all([
      User.findById(userId).select("_id role").lean(),
      Class.findById(id).select("_id instructor sessionStatus").lean(),
    ]);

    if (!user) throw new NotFoundError("User not found");
    if (!classSession) throw new NotFoundError("Class not found");

    const isInstructor = classSession.instructor.toString() === userId;
    if (!isInstructor && classSession.sessionStatus !== "live") {
      throw new BadRequestError("Class has not started yet");
    }

    const channelName = `class-${classSession._id}`;
    const account = user._id.toString();
    const token = generateAgoraToken(channelName, account, user.role);

    res.status(200).json({
      token,
      channelName,
      account,
      role: user.role,
      classId: classSession._id,
      sessionStatus: classSession.sessionStatus,
      expiresIn: 3600,
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.msg || error.message });
  }
};

export const getClassesOfStudent = async (req, res) => {
  try {
    const { userId } = req.user;
    const { currentPage } = req.query;
    const student = await User.findById(userId).select(
      "enrolledCourses.course",
    );
    if (!student) {
      throw new NotFoundError("No student found");
    }
    const courseIds = student.enrolledCourses.map((ec) => ec.course);

    if (!courseIds.length) {
      return res
        .status(200)
        .json({ classes: [], totalPage: 1, totalClasses: 0 });
    }
    const queryObject = {
      course: { $in: courseIds },
      sessionStatus: { $in: ["scheduled", "live"] },
    };
    const page = Number(currentPage) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const [classes, totalCount] = await Promise.all([
      Class.find(queryObject)
        .populate(
          "instructor",
          "firstName lastName profilePicUrl instructorDetails",
        )
        .populate("course", "courseName")
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Class.countDocuments(queryObject),
    ]);

    res.status(200).json({
      classes: classes,
      totalPages: Math.ceil(totalCount / limit),
      totalClasses: totalCount,
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.msg || error.message });
  }
};
