import ChatRoom from "../models/ChatRoomModel.js";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import SubCommunity from "../models/SubCommunity.js";
import Community from "../models/CommunityModel.js";
import ChatRoomRead from "../models/ChatRoomReadModel.js";
import Message from "../models/MessageModel.js";

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
  const { search } = req.query;

  const queryObject = {};
  if (search && search.trim() !== "") {
    queryObject.chatRoomName = {
      $regex: search.trim(),
      $options: "i",
    };
  }
  const chatRooms = await ChatRoom.find(queryObject)
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

export const getUnreadCounts = async (req, res) => {
  try {
    const { userId, chatRoomIds } = req.query;
    if (!userId || !chatRoomIds) {
      throw new BadRequestError("User Id and chatRoomIds are required");
    }
    const roomIds = chatRoomIds.split(",");
    const reads = await ChatRoomRead.find({
      userId,
      chatRoomId: { $in: roomIds },
    });
    const lastReadMap = {};
    reads.forEach((r) => {
      lastReadMap[r.chatRoomId.toString()] = r.lastReadAt;
    });
    const counts = {};
    await Promise.all(
      roomIds.map(async (roomId) => {
        const since = lastReadMap[roomId] || new Date(0);
        counts[roomId] = await Message.countDocuments({
          chatRoomId: roomId,
          createdAt: { $gt: since },
          user: { $ne: userId },
        });
      }),
    );
    res.status(200).json(counts);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.message || error.msg });
  }
};
