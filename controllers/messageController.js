import { NotFoundError } from "../errors/customErrors.js";
import Message from "../models/MessageModel.js";
import SubCommunity from "../models/SubCommunity.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const addMessage = async (req, res) => {
  const { message, subCommunityId } = req.body;

  const newMessage = new Message({
    message: message,
    user: req.user.userId,
  });
  await newMessage.save();
  const subCommunity = await SubCommunity.findById(subCommunityId);
  if (!subCommunity) throw new NotFoundError("sub community not found");
  subCommunity.messages.push(newMessage._id);
  const receiverSocketId = getReceiverSocketId(req.user.userId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  await subCommunity.save();
  res.status(200).json({ message: "successfully created" });
};

export const getAllMessages = async (req, res) => {
  const { id } = req.params;
  const subCommunity = await SubCommunity.findById(id).populate({
    path: "messages", // Populate the 'messages' array
    populate: {
      path: "user", // Populate the 'user' field inside each message
      model: "User", // Specify that the 'user' field refers to the 'User' model
    },
  });
  if (!subCommunity) throw new NotFoundError("no messages found");
  res.status(200).json(subCommunity.messages);
};
