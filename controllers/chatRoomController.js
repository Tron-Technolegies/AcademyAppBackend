import ChatRoom from "../models/ChatRoomModel.js";
import { NotFoundError } from "../errors/customErrors.js";
import SubCommunity from "../models/SubCommunity.js";
import Community from "../models/CommunityModel.js";

export const addChatRoom = async (req, res) => {
  const { chatRoomName, relatedCommunity, relatedSubCommunity } = req.body;
  const newChatRoom = new ChatRoom({
    chatRoomName: chatRoomName,
    relatedCommunity: relatedCommunity,
    relatedSubCommunity: relatedSubCommunity,
  });
  await newChatRoom.save();
  res.status(201).json({ message: "success created" });
};

export const getAllChatRoom = async (req, res) => {
  const chatRooms = await ChatRoom.find()
    .populate("relatedCommunity", "communityName")
    .populate("relatedSubCommunity", "subCommunityName");
  if (!chatRooms) throw new NotFoundError("chat rooms not found");
  res.status(200).json(chatRooms);
};

export const updateChatRoom = async (req, res) => {
  const { chatRoomName, relatedCommunity, relatedSubCommunity } = req.body;
  const { id } = req.params;
  const chatRoom = await ChatRoom.findById(id);
  if (!chatRoom) throw new NotFoundError("chat room not found");
  chatRoom.chatRoomName = chatRoomName;
  chatRoom.relatedCommunity = relatedCommunity;
  chatRoom.relatedSubCommunity = relatedSubCommunity;
  await chatRoom.save();

  const updateChatRoom = await ChatRoom.findById(id)
    .populate("relatedCommunity")
    .populate("relatedSubCommunity");
  res.status(200).json({ message: "chat room is updated" });
};

export const getSingleChatRoom = async (req, res) => {
  const { id } = req.params;
  const chatRoom = await ChatRoom.findById(id);
  if (!chatRoom) throw new NotFoundError("chat room nt found");
  res.status(200).json(chatRoom);
};

export const deleteChatRoom = async (req, res) => {
  const { id } = req.params;
  const chatRoom = await ChatRoom.findByIdAndDelete(id);
  if (!chatRoom) throw new NotFoundError("chat room not found");
  res.status(200).json({ message: "chat is deleted" });
};

export const getChatRoomByCommunity = async (req, res) => {
  const { communityId } = req.query;
  const chatRoom = await ChatRoom.find({ relatedCommunity: communityId });
  if (!chatRoom) throw new NotFoundError("no chat room found");
  res.status(200).json(chatRoom);
};

export const getChatRoomBySubCommunity = async (req, res) => {
  const { subCommunityId } = req.query;
  const chatRoom = await ChatRoom.find({ relatedSubCommunity: subCommunityId });
  if (!chatRoom) throw new NotFoundError("no chat room found");
  res.status(200).json(chatRoom);
};
