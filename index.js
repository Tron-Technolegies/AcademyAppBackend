import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import express from "express";

const app = express();
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
