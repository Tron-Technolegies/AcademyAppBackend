import mongoose, { model, Mongoose, Schema, Types } from "mongoose";

const EnrolledCoursesSchema = new Schema({
  //this schema is used for the enrolled courses in user schema
  courses: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Course",
    },
  ],
  progress: {
    type: Number,
  },
});

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "student",
      enum: ["student", "teacher", "admin"], //only values from these array are accepted
    },

    otp: { type: String },

    faceEmbeddings: {
      type: [Number], //faceEmbeddings will be array of numbers
    },

    firstName: String,
    lastName: String,
    dateOfBirth: Date,

    gender: {
      type: String,
      enum: ["male", "female"],
    },

    address: String,
    saved: [
      {
        type: mongoose.Types.ObjectId, //this is mongodb id
        ref: "Video", //saved will be an array of IDs of the video model
      },
    ],
    enrolledCourses: {
      type: [EnrolledCoursesSchema], //array of objects cant be  written as array of numbers and array of ids only in case of mongo db so we have to seperate schema (enrolledCourseSchema) for that object and call imsode that array
    }, //this "type" has another objects that's why we created another schema

    history: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Video",
      },
    ],
    community: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Community", //naming should be capital
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = model("User", UserSchema);

export default User;
