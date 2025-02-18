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
    .isAlphanumeric()
    .withMessage("password must contain letters and numbers"),
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
