import express from "express";
import http from "http";
import { Server } from "socket.io";
import Message from "../models/MessageModel.js";
import { timeStamp } from "console";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "PUT", "POST", "PATCH"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected: ", socket.id);
  socket.on("joinCommunity", async (subCommunityId) => {
    socket.join(subCommunityId);
    console.log(`User ${socket.id} joined sub community ${subCommunityId}`);

    const messages = await Message.find({ subCommunityId })
      .populate({
        path: "messages", // Populate the 'messages' array
        populate: {
          path: "user", // Populate the 'user' field inside each message
          model: "User", // Specify that the 'user' field refers to the 'User' model
        },
      })
      .sort({ timeStamp: 1 });
    socket.emit("previousMessages", messages);
  });
  socket.on("sendMessage", async (data) => {
    const { subCommunityId, user, message } = data;
    const newMessage = new Message({ subCommunityId, user, message });
    await newMessage.save();
    io.to(subCommunityId).emit("receiveMessage", {
      user,
      message,
      timestamp: newMessage.createdAt,
    });
  });
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});
export { app, io, server };
