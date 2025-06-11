import { NotFoundError } from "../errors/customErrors.js";
import User from "../models/UserModel.js";

export const getUserStats = async (req, res, next) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newUserCount = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
    role: "student",
  });
  const activeUserCount = await User.countDocuments({
    role: "student",
  });
  const subscriberCount = await User.countDocuments({
    role: "student",
    subscriptionType: "subscriber",
  });

  const newUsers = await User.find({
    createdAt: { $gte: thirtyDaysAgo },
    role: "student",
  }).select("firstName username phoneNumber createdAt");

  return res.status(200).json({
    newUserCount,
    activeUserCount,
    subscriberCount,
    newUsers,
  });
};
//comment
