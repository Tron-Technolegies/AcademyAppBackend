import { body, validationResult } from "express-validator";
import { BadRequestError } from "../errors/customErrors.js";
import User from "../models/UserModel.js";

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

export const validateRegisterInput = withValidationErrors([
  body("phoneNumber")
    .notEmpty()
    .withMessage("phone number is required")
    .custom(async (phoneNumber) => {
      const user = await User.findOne({ phoneNumber: phoneNumber });
      if (user) throw new BadRequestError("Phone Number already exists");
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/)
    .withMessage(
      "password must contain at least one letter,one number, and can include special characters"
    ),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email) => {
      const user = await User.findOne({ email: email });
      if (user) throw new BadRequestError("Email already exists");
    }),
]);

export const validateLoginInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email format"),
  body("password").notEmpty().withMessage("password is required"),
]);

export const validateOtpInput = withValidationErrors([
  body("otp").notEmpty().withMessage("OTP is required"),
]);

export const validateUserDetailInput = withValidationErrors([
  body("firstName").notEmpty().withMessage("First Name is required "),
  body("lastName").notEmpty().withMessage("Last Name is required "),
  body("dateOfBirth").notEmpty().withMessage("Date of Birth is required "),
  body("role").notEmpty().withMessage("role is required "),
  body("gender").notEmpty().withMessage("gender is required "),
  body("address").notEmpty().withMessage("address is required "),
]);

export const validateUpdateDetailsInput = withValidationErrors([
  body("firstName").notEmpty().withMessage("First Name is required "),
  body("lastName").notEmpty().withMessage("Last Name is required "),
  body("dateOfBirth").notEmpty().withMessage("Date of Birth is required "),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email: email });
      if (user && user._id.toString() !== req.user.userId.toString()) {
        throw new BadRequestError("email already exists");
      }
    }),
  body("gender").notEmpty().withMessage("gender is required "),
  body("address").notEmpty().withMessage("address is required "),
  body("phoneNumber")
    .notEmpty()
    .withMessage("phoneNumber is required ")
    .custom(async (phoneNumber, { req }) => {
      const user = await User.findOne({ phoneNumber: phoneNumber });
      if (user && user._id.toString() !== req.user.userId.toString()) {
        //comparing the fetched user id with the id of the person who sent this request
        throw new BadRequestError("phone number already exists");
      }
    }),
]);

export const validateCategoryInput = withValidationErrors([
  body("categoryName").notEmpty().withMessage("Category name is required"),
]);

export const validateCourseInput = withValidationErrors([
  body("courseName").notEmpty().withMessage("course name is required"),
  body("courseCategory").notEmpty().withMessage("course category is required"),
  body("instructor").notEmpty().withMessage("instructor is required"),
  body("courseOverView").notEmpty().withMessage("courseOverView is required"),
]);

export const validateInstructorInput = withValidationErrors([
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email) => {
      const user = await User.findOne({ email: email });
      if (user) throw new BadRequestError("Email already exists");
    }),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("phoneNumber").notEmpty().withMessage("Phone number is required"),

  body("gender")
    .isIn(["male", "female"])
    .withMessage("Gender must be one of: male, female"),

  body("designation").notEmpty().withMessage("Designation is required"),
]);
export const validateUpdateInstructorInput = withValidationErrors([
  body("fullName").notEmpty().withMessage("Full name is required"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email) => {
      const user = await User.findOne({ email: email });
      if (user) throw new BadRequestError("Email already exists");
    }),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("phoneNumber").notEmpty().withMessage("Phone number is required"),

  body("gender")
    .isIn(["male", "female"])
    .withMessage("Gender must be one of: male, female"),

  body("designation").notEmpty().withMessage("Designation is required"),
]);

export const validateModuleInput = withValidationErrors([
  body("moduleName").notEmpty().withMessage("module name is required"),
  body("relatedCourse").notEmpty().withMessage(" related course is required"),
]);

export const validateCommunityInput = withValidationErrors([
  body("communityName").notEmpty().withMessage("community is not found"),
]);

export const validateVideoInput = withValidationErrors([
  body("videoName").notEmpty().withMessage("video name is not found"),
  body("videoURL").notEmpty().withMessage("video url is not found"),
  body("relatedModule").notEmpty().withMessage(" related module is required"),
  body("relatedCourse").notEmpty().withMessage("related course is required"),
]);

export const validateSubCommunityInput = withValidationErrors([
  body("subCommunityName")
    .notEmpty()
    .withMessage(" sub community is not found"),
  body("relatedCommunity")
    .notEmpty()
    .withMessage(" related community is not found"),
]);

export const validateClassInput = withValidationErrors([
  body("className").notEmpty().withMessage("class is not found"),
  body("date").notEmpty().withMessage("date is required"),
  body("time").notEmpty().withMessage("time is required"),
  body("instructor").notEmpty().withMessage("instructor is required"),
  body("course").notEmpty().withMessage("course is requires "),
]);

export const validateSaveVideoInput = withValidationErrors([
  body("id")
    .notEmpty()
    .withMessage("id is not required")
    .isMongoId()
    .withMessage("invalid id"),
]);

export const validateForgotPasswordInput = withValidationErrors([
  body("email").notEmpty().withMessage("email is required"),
]);

export const validateResetPasswordInput = withValidationErrors([
  body("password").notEmpty().withMessage("password is required"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("confirm password is required"),
]);

export const validateUpdatePasswordInput = withValidationErrors([
  body("currentPassword")
    .notEmpty()
    .withMessage("current password is required"),
  body("newPassword").notEmpty().withMessage("new password is required"),
]);

export const validateAddMessageInput = withValidationErrors([
  body("message").notEmpty().withMessage("message is required"),
  body("subCommunityId")
    .notEmpty()
    .withMessage("sub community id is required")
    .isMongoId()
    .withMessage("invalid id"),
]);

export const validatePlanInput = withValidationErrors([
  body("planName").notEmpty().withMessage("plan name is required"),
  body("price").notEmpty().withMessage("price is not found"),
  body("features").notEmpty().withMessage("features is required"),
]);

export const validateResendOtpInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("invalid email format"),
]);

export const validateEnrollCourseInput = withValidationErrors([
  body("id")
    .notEmpty()
    .withMessage("course Id is required")
    .isMongoId()
    .withMessage("Invalid Course Id format"),
]);

export const validateCourseProgressInput = withValidationErrors([
  body("videoId")
    .notEmpty()
    .withMessage("video Id is required")
    .isMongoId()
    .withMessage("Invalid video Id format"),
]);

export const validateManagePlanInput = withValidationErrors([
  body("planType").notEmpty().withMessage("plan type is required"),
]);

export const validateChatRoomInput = withValidationErrors([
  body("chatRoomName").notEmpty().withMessage("chat room name is required"),
  body("relatedCommunity")
    .notEmpty()
    .withMessage("Related community is required"),
  body("relatedSubCommunity")
    .notEmpty()
    .withMessage("related sub-community is required"),
]);
