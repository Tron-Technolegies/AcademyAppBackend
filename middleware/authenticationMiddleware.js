import { createClient } from "redis";
import {
  UnauthenticatedError,
  UnauthorizedError,
} from "../errors/customErrors.js";
import { verifyJWT } from "../utils/jwtUtils.js";
import User from "../models/UserModel.js";

export const redisClient = createClient();

export const authenticateUser = async (req, res, next) => {
  //middleware for decoding the token, middleware for checking if the user has valid token or not

  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token; //for flutter
  // changed this route
  // const { token } = req.cookies; //for web-apps
  if (!token) throw new UnauthenticatedError("unable to access");

  try {
    const decoded = verifyJWT(token);

    const { userId, role } = decoded;
    const user = await User.findById(userId);
    if (user.subscriptionType === "subscriber") {
      const today = new Date();
      if (user.subscriptionEndDate < today) {
        user.subscriptionType === "free-user";
        await user.save();
      }
    }
    if (user.subscriptionType === "free-trial") {
      const today = new Date();
      if (user.freeTrialEnd < today) {
        user.subscriptionType === "free-user";
        await user.save();
      }
    }
    req.user = { userId: userId, role: role };
    next();
  } catch (error) {
    console.log(error);
    throw new UnauthenticatedError("Invalid Authorization");
  }
};

export const isAdmin = async (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    throw new UnauthorizedError("Access Denied");
  }
};

export const isPaidSubscriber = async (req, res, next) => {
  if (req.user.subscriptionType === "subscriber") {
    next();
  } else {
    throw new UnauthorizedError("Access Denied");
  }
};
