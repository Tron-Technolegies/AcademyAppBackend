import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import courseCategoryRouter from "./routes/courseCategoryRouter.js";
import courseRouter from "./routes/courseRouter.js";
import InstructorRouter from "./routes/instructorRouter.js";
import ModuleRouter from "./routes/moduleRouter.js";
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import { authenticateUser } from "./middleware/authenticationMiddleware.js";

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const _dirname = dirname(fileURLToPath(import.meta.url));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve(_dirname, "./public")));

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

//routes:
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", authenticateUser, userRouter);
app.use("/api/v1/category", authenticateUser, courseCategoryRouter);
app.use("/api/v1/course", authenticateUser, courseRouter);
app.use("/api/v1/instructor", authenticateUser, InstructorRouter);
app.use("/api/v1/module", authenticateUser, ModuleRouter);

app.use("*", (req, res) => {
  res.status(404).json({ message: "not found" }); //this error will trigger when the request route do not match any of the above routes
});

app.use(errorHandlerMiddleware); //all errors other than 404

const port = 3000 || process.env.port;
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("database successfully connected");
  app.listen(port, () => {
    console.log(`server connected on ${port}`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
