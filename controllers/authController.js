import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from "../errors/customErrors.js";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { createJWT } from "../utils/jwtUtils.js";
import { sendMail, transporter } from "../utils/nodemailer.js";
import FaceCompare from "../utils/faceCompare.js";
// import { compareFaces, loadModels } from "../utils/faceModel.js";

export const registerUser = async (req, res) => {
  const { email, password, phoneNumber } = req.body; //to access the items sent from front-end
  const hashedPassword = await hashPassword(password); //hashing the password

  const newUser = new User({
    //creating a new user object for saving into the database , User is the name of the model(UserModel.js)

    email: email,
    phoneNumber: phoneNumber,
    password: hashedPassword,
  });

  const code = Math.floor(1000 + Math.random() * 9000); //generating random otp
  newUser.otp = code;
  await newUser.save(); //saving all the user details including otp

  const mailOptions = {
    from: {
      name: "Tron Academy App",
      address: process.env.NODEMAILER_EMAIL,
    },
    to: newUser.email, //sending email to newUser
    subject: "verification code",
    text: `You have requested a verification code for your Tron Academy account. Your verification code is ${code}`,
  };

  await sendMail(transporter, mailOptions);

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

export const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("no user found");
  if (user.otp == otp) {
    res.status(200).json({ message: "Successfully verified" });
  } else throw new UnauthenticatedError("Invalid otp");
};

export const logout = async (req, res) => {
  // const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
  // if (!token) throw new UnauthenticatedError("unable to access");
  // const decoded = verifyJWT(token);
  // decoded.exp = Date.now();
  const token = jwt.sign({ userId: "logout" }, process.env.JWT_SECRET, {
    expiresIn: "1s",
  });
  const tenDay = 1000 * 60 * 60 * 24 * 10;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + tenDay),
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logged out successfully ", token });
};

// export const saveFace = async (req, res) => {
//   //code for face recognition to add face
//   const user = await User.findById(req.user.userId);
//   if (!user) throw new NotFoundError("user not found");
//   const imageBuffer = req.file.buffer; //we get id from the buffer file , it is in different format
//   const base64Image = imageBuffer.toString("base64"); //coverting to string
//   user.faceEmbeddings = base64Image; //store it in the faceembeddings.
//   await user.save();
//   res.status(200).json({ message: "face saved successfully" });
// };

// export const compareFace = async (req, res) => {
//   //code to compare face.
//   const user = await User.findById(req.user.userId);
//   if (!user) throw new NotFoundError("user not found");
//   await loadModels();
//   const imageBuffer = req.file.buffer;
//   const newImageBase64 = imageBuffer.toString("base64");

//   const isMatch = await compareFaces(user.faceEmbeddings, newImageBase64);

//   if (isMatch) {
//     res.status(200).json({ message: "face verification successful" });
//   } else {
//     res.status(401).json({ message: "verification failed" });
//   }
// };

export const sendResetPassword = async (req, res) => {
  const { id } = req.params;
  res.render("resetPassword.ejs", { userId: id });
};

export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new NotFoundError("user not found");
  const mailOptions = {
    from: {
      name: "Tron Academy App",
      address: process.env.NODEMAILER_EMAIL,
    },
    to: user.email, //sending email to newUser
    subject: "reset password",
    text: `You have requested a password reset for your Tron Academy account. You can reset your password in the following link.
    https://api.tronacademy.in/api/v1/auth/resetPassword/${user.id}`,
  };

  await sendMail(transporter, mailOptions);
  res.status(200).json({ message: "link has been sent to your email" });
};

export const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (password === confirmPassword) {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError("user not found");
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    await user.save();
    res.status(200).send("<h1>Password has been Updated. </h1>");
  } else {
    res.status(400).send("<h1>Password does not match</h1>");
  }
};

export const registerFace = async (req, res) => {
  const { faceEmbeddings } = req.body;
  const faceData = JSON.parse(faceEmbeddings);
  if (!faceData.landmarks || Object.keys(faceData.landmarks).length < 3)
    throw new BadRequestError(
      "invalid face data : insufficient facial land marks"
    );
  const requiredLandmarks = ["leftEye", "rightEye", "noseBase"];
  const missingLandmarks = requiredLandmarks.filter(
    (landmark) => !faceData.landmarks[landmark]
  );

  if (missingLandmarks.length > 0)
    throw new BadRequestError("invalid face data missing required land marks");
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("user not found");
  user.faceEmbeddings = faceEmbeddings;
  user.faceVerificationHistory.push({
    timestamp: new Date(),
    success: true,
    ipAddress: req.ip || null,
    deviceInfo: req.headers["user-agent"] || null,
  });
  await user.save();
  res.status(200).json({ message: "created successfully" });
};

export const verifyFace = async (req, res) => {
  const { faceEmbeddings } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("user not found");
  const faceCompare = new FaceCompare();
  const { matched, similarity, threshold } =
    await faceCompare.compareEmbeddings(faceEmbeddings, user.faceEmbeddings);

  user.faceVerificationHistory.push({
    timestamp: new Date(),
    success: matched,
    ipAddress: req.ip || null,
    deviceInfo: req.headers["user-agent"] || null,
  });
  res.status(200).json({
    success: true,
    matched,
    similarity: similarity.toFixed(4),
    threshold,
  });
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError("Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("User not found");

  const code = Math.floor(1000 + Math.random() * 9000);
  user.otp = code;
  await user.save();

  const mailOptions = {
    from: {
      name: "Tron Academy App",
      address: process.env.NODEMAILER_EMAIL,
    },
    to: user.email,
    subject: "Resend Verification Code",
    text: `You requested a new verification code for your Tron Academy account. Your new OTP is ${code}`,
  };

  await sendMail(transporter, mailOptions);

  res.status(200).json({ message: "OTP has been resent to your email" });
};

export const logoutAdmin = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(200).json({ message: "successfully logged out" });
};
