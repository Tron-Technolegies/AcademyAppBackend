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
