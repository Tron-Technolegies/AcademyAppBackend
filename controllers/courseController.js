import Course from "../models/CourseModel.js";
import { NotFoundError } from "../errors/customErrors.js";
import User from "../models/UserModel.js";

export const addCourse = async (req, res) => {
  const { courseName, courseCategory, instructor, courseOverView } = req.body;
  const newCourse = new Course({
    courseName: courseName,
    courseCategory: courseCategory,
    instructor: instructor,
    courseOverView: courseOverView,
  });
  await newCourse.save();
  res.status(201).json({ message: "successfully created" });
};

export const getAllCourse = async (req, res) => {
  const courses = await Course.find().populate("instructor");
  if (!courses) throw new NotFoundError("course not found");
  res.status(200).json(courses);
};

export const updateCourse = async (req, res) => {
  const { courseName, courseCategory, instructor, courseOverView } = req.body;
  const { id } = req.params;
  const course = await Category.findById(id);
  if (!course) throw new NotFoundError("course not found");
  course.courseName = courseName;
  course.courseCategory = courseCategory;
  course.instructor = instructor;
  course.courseOverView = courseOverView;
  await course.save();
  res.status(200).json({ message: "course is updated" });
};

export const getSingleCourse = async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) throw new NotFoundError("course not found");
  res.status(200).json(course);
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  const course = await Course.findByIdAndDelete(id);
  if (!course) throw new NotFoundError("course not found");
  res.status(200).json({ message: "deleted successfully" });
};

export const getCourseByCategory = async (req, res) => {
  const { categoryId } = req.query;
  const course = await Course.find({ courseCategory: categoryId });
  if (!course) throw new NotFoundError("course not found");
  res.status(200).json(course);
};

export const updateEnrollCourse = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw NotFoundError("user not found");
  const newCourse = {
    course: req.body.id,
    progress: 0,
  };
  user.enrolledCourses.push(newCourse);
  await user.save();
  res.status(200).json({ message: "successfully enrolled" });
};

export const getEnrolledCourse = async (req, res) => {
  const user = await User.findById(req.user.userId, {
    enrolledCourses: true,
  }).populate("enrolledCourses.course");
  if (!user) throw new NotFoundError("user not found");
  res.status(200).json(user);
};
