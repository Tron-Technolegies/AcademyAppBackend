import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import User from "../models/UserModel.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { createJWT } from "../utils/jwtUtils.js";

export const registerUser = async (req, res) => {
  const { email, password, phoneNumber } = req.body; //to access the items sent from front-end
  const hashedPassword = await hashPassword(password); //hashing the password

  const newUser = new User({
    //creating a new user object for saving into the database , User is the name of the model(UserModel.js)

    email: email,
    phoneNumber: phoneNumber,
    password: hashedPassword,
  });
  await newUser.save();
  const token = createJWT({ userId: newUser._id, role: newUser.role }); //created token using the newly created users id and role as payload
  const tenDay = 1000 * 60 * 60 * 24 * 10;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + tenDay),
    secure: process.env.NODE_ENV === "production",
  });
  res.status(201).json({
    message: "user created successfully",
    token,
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) throw new NotFoundError("user not found");
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new BadRequestError("Invalid credentials");
  const token = createJWT({ userId: user._id, role: user.role }); //created token using the newly created users id and role as payload
  const tenDay = 1000 * 60 * 60 * 24 * 10;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + tenDay),
    secure: process.env.NODE_ENV === "production",
  });
  res.status(201).json({
    message: "logged in successfully",
    token,
  });
};
