import mongoose, { model, Mongoose, Schema, Types } from "mongoose";

const SubscriptionSchema = new Schema({
  subscriptionName: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
});

const EnrolledCoursesSchema = new Schema({
  //this schema is used for the enrolled courses in user schema
  course: {
    type: mongoose.Types.ObjectId,
    ref: "Course",
  },
  watchedVideos: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Video",
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
    profilePicUrl: {
      type: String,
    },
    profilePicPublicId: {
      type: String,
    },
    role: {
      type: String,
      default: "student",
      enum: ["student", "teacher", "admin"], //only values from these array are accepted
    },
    status: {
      type: String,
    },

    otp: { type: String },

    faceEmbeddings: {
      type: String,
      default: null,
    },
    faceVerificationHistory: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        success: {
          type: Boolean,
          required: true,
        },
        ipAddress: {
          type: String,
          default: null,
        },
        deviceInfo: {
          type: String,
          default: null,
        },
      },
    ],
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
    subscriptionType: {
      type: String,
    },
    freeTrialStart: {
      type: Date,
    },
    freeTrialEnd: {
      type: Date,
    },
    subscriptionHistory: {
      type: [SubscriptionSchema],
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },
    stripeCustomerId: String,
    paymentMethods: [
      {
        paymentMethodId: String,
        cardBrand: String,
        cardLast4: String,
        isDefault: Boolean,
        addedAt: { type: Date, default: Date.now },
      },
    ],
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = model("User", UserSchema);

export default User;
