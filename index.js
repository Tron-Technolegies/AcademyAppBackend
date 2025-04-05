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
import cors from "cors";

//router imports
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import courseCategoryRouter from "./routes/courseCategoryRouter.js";
import courseRouter from "./routes/courseRouter.js";
import instructorRouter from "./routes/instructorRouter.js";
import moduleRouter from "./routes/moduleRouter.js";
import communityRouter from "./routes/communityRouter.js";
import videoRouter from "./routes/videoRouter.js";
import subCommunityRouter from "./routes/subCommunityRouter.js";
import classRouter from "./routes/classRouter.js";
import messageRouter from "./routes/messageRouter.js";
//custom middleware imports
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import { authenticateUser } from "./middleware/authenticationMiddleware.js";
import { app, server } from "./socket/socket.js";

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

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Ensure all necessary methods are allowed
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.options("*", cors());
app.get("/", (req, res) => {
  res.sendFile("index.html");
});

//routes:
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", authenticateUser, userRouter);
app.use("/api/v1/category", authenticateUser, courseCategoryRouter);
app.use("/api/v1/course", authenticateUser, courseRouter);
app.use("/api/v1/instructor", authenticateUser, instructorRouter);
app.use("/api/v1/module", authenticateUser, moduleRouter);
app.use("/api/v1/community", authenticateUser, communityRouter);
app.use("/api/v1/video", authenticateUser, videoRouter);
app.use("/api/v1/subCommunity", authenticateUser, subCommunityRouter);
app.use("/api/v1/class", authenticateUser, classRouter);
app.use("/api/v1/messages", authenticateUser, messageRouter);

app.use("*", (req, res) => {
  res.status(404).json({ message: "not found" }); //this error will trigger when the request route do not match any of the above routes
});

app.use(errorHandlerMiddleware); //all errors other than 404

const port = 3000 || process.env.port;
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("database successfully connected");
  server.listen(port, () => {
    console.log(`server connected on ${port}`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
///
