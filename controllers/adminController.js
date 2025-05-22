import { NotFoundError } from "../errors/customErrors.js";
import User from "../models/UserModel.js";

export const getUserStats = async (req, res, next) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newUserCount = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const activeUserCount = await User.countDocuments();
  const subscriberCount = await User.countDocuments({
    subscriptionType: "subscriber",
  });

  if (!newUserCount && !activeUserCount && !subscriberCount) {
    throw new NotFoundError("No users found");
  }

  return res.status(200).json({
    newUserCount,
    activeUserCount,
    subscriberCount,
  });
};
