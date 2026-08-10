import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import Course from "../models/CourseModel.js";
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
    firstName: fullName,
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
  res.status(200).json(instructors);
};

export const updateInstructor = async (req, res) => {
  const { fullName, email, phoneNumber, gender, designation } = req.body;
  const { id } = req.params;
  const instructor = await User.findById(id);
  if (!instructor) throw new NotFoundError("instructor not found");
  instructor.instructorDetails[0].instructorName = fullName;
  instructor.instructorDetails[0].instructorRole = designation;
  instructor.email = email;
  instructor.phoneNumber = phoneNumber;
  instructor.gender = gender;

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

export const getAllEnrolledStudents = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      currentPage = 1,
      limit = 10,
      search = "",
      courseId = "",
    } = req.query;
    const page = Number(currentPage) || 1;
    const skip = (page - 1) * limit;

    const myCourses = await Course.find({ instructor: userId }).select("_id");
    const courseIds = myCourses.map((c) => c._id);
    if (!courseIds.length) {
      return res.status(200).json({
        success: true,
        totalStudents: 0,
        page: page,
        totalPages: 1,
        students: [],
      });
    }
    let matchCourseIds = courseIds;
    if (courseId) {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw new BadRequestError("Invalid CourseId for filtering");
      }
      const isOwnCourse = courseIds.some((id) => id.equals(courseId));
      if (!isOwnCourse) {
        throw new BadRequestError("This course doesn't belong to you");
      }
      matchCourseIds = [new mongoose.Types.ObjectId(courseId)];
    }
    const searchRegex = new RegExp(search, "i");

    const result = await User.aggregate([
      { $match: { role: "student" } },
      { $unwind: "$enrolledCourses" },
      { $match: { "enrolledCourses.course": { $in: matchCourseIds } } },
      {
        $lookup: {
          from: "courses",
          localField: "enrolledCourses.course",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      { $unwind: "$courseDetails" },
      {
        $group: {
          _id: "$_id",
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          email: { $first: "$email" },
          phoneNumber: { $first: "$phoneNumber" },
          profilePicUrl: { $first: "$profilePicUrl" },
          courses: {
            $push: {
              courseId: "$courseDetails._id",
              courseName: "$courseDetails.courseName",
              progress: "$enrolledCourses.progress",
            },
          },
        },
      },
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { firstName: searchRegex },
                  { lastName: searchRegex },
                  { "courses.courseName": searchRegex },
                ],
              },
            },
          ]
        : []),
      { $sort: { firstName: 1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);
    const students = result[0]?.data;
    const total = result[0]?.totalCount[0]?.count || 0;
    res.status(200).json({
      success: true,
      totalStudents: total,
      page: page,
      totalPages: Math.ceil(total / limit),
      students,
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};
