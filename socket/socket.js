import express from "express";
import http from "http";
import { Server } from "socket.io";
import Message from "../models/MessageModel.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import uploadToCloudinary from "../utils/cloudinaryUtils.js";
import { formatChatImage } from "../middleware/multerMiddleware.js";
import { Buffer } from "buffer";
import ChatRoomRead from "../models/ChatRoomReadModel.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure Socket.IO server with CORS settings
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (adjust for production)
    methods: ["GET", "PUT", "POST", "PATCH"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected: ", socket.id);

  // socket.on("joinChatRoom", async (chatRoomId) => {
  //   try {
  //     socket.join(chatRoomId);
  //     console.log(`User ${socket.id} joined chat room ${chatRoomId}`);

  //     const messages = await Message.find({ chatRoomId })
  //       .populate("user")
  //       .sort({ timeStamp: 1 });

  //     socket.emit("previousMessages", messages);
  //   } catch (error) {
  //     console.error("Error joining chat room:", error);
  //     socket.emit("error", "Failed to join chat room");
  //   }
  // });
  socket.on("joinChatRoom", async ({ chatRoomId, userId }) => {
    try {
      socket.join(chatRoomId);
      console.log(`User ${socket.id} joined chat room ${chatRoomId}`);

      const messages = await Message.find({ chatRoomId })
        .populate("user")
        .sort({ timeStamp: 1 });

      const readRecord = userId
        ? await ChatRoomRead.findOne({ userId, chatRoomId })
        : null;

      socket.emit("previousMessages", {
        messages,
        lastReadMessageId: readRecord?.lastReadMessageId?.toString() || null,
      });
    } catch (error) {
      console.error("Error joining chat room:", error);
      socket.emit("error", "Failed to join chat room");
    }
  });

  // Lightweight join for rooms NOT currently open — just so this socket
  // receives receiveMessage broadcasts for badge purposes, without the
  // cost of fetching full message history.

  socket.on("subscribeRooms", (chatRoomIds = []) => {
    chatRoomIds.forEach((id) => socket.join(id));
  });

  socket.on("unsubscribeRooms", (chatRoomIds = []) => {
    chatRoomIds.forEach((id) => socket.leave(id));
  });

  socket.on("markAsRead", async ({ chatRoomId, userId, lastMessageId }) => {
    try {
      if (!chatRoomId || !userId || !lastMessageId) return;
      await ChatRoomRead.findOneAndUpdate(
        {
          userId,
          chatRoomId,
        },
        { lastReadMessageId: lastMessageId, lastReadAt: new Date() },
        { upsert: true },
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  });

  socket.on("sendMessage", async (data) => {
    try {
      const { chatRoomId, user, message } = data;
      // Create new text message in database
      const newMessage = new Message({
        chatRoomId,
        user,
        message,
        type: "text",
      });
      await newMessage.save();
      await newMessage.populate("user");
      console.log("Message saved:", newMessage);

      // Broadcast message to all in the sub-community
      io.to(chatRoomId).emit("receiveMessage", {
        _id: newMessage._id,
        user: newMessage.user,
        message,
        type: "text",
        timestamp: newMessage.createdAt,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", "Failed to send message");
    }
  });

  socket.on("sendImage", async (data) => {
    try {
      const { chatRoomId, user, imageBuffer, imageName } = data;

      // Upload image to Cloudinary
      const buffer = Buffer.from(imageBuffer);
      const file = formatChatImage(buffer, imageName);
      const result = await cloudinary.uploader.upload(file, {
        public_id: `${Date.now()}_${imageName}`,
      });

      // Save message with image URL to database
      const newMessage = new Message({
        chatRoomId,
        user,
        imageUrl: result.secure_url,
        type: "image",
      });
      await newMessage.save();
      await newMessage.populate("user");
      console.log(result.secure_url);

      // Broadcast image message
      io.to(chatRoomId).emit("receiveMessage", {
        _id: newMessage._id,
        user: newMessage.user,
        imageUrl: result.secure_url,
        type: "image",
        timestamp: newMessage.createdAt,
      });
    } catch (error) {
      console.error("Error sending image:", error);
      socket.emit("error", "Failed to send image");
    }
  });

  socket.on("sendVoice", async (data) => {
    console.log("Received voice data:", data); // Check data received

    try {
      const { chatRoomId, user, audioBuffer, audioName } = data;
      const buffer = new Buffer.from(audioBuffer);
      const file = formatChatImage(buffer, audioName);

      const result = await cloudinary.uploader.upload(file, {
        resource_type: "video", // Needed for audio files too
        public_id: `${Date.now()}_${audioName}`,
      });

      const newMessage = new Message({
        chatRoomId,
        user,
        audioUrl: result.secure_url,
        type: "audio",
      });

      await newMessage.save();
      await newMessage.populate("user");

      io.to(chatRoomId).emit("receiveMessage", {
        _id: newMessage._id,
        user: newMessage.user,
        audioUrl: result.secure_url,
        type: "audio",
        timestamp: newMessage.createdAt,
      });
      console.log("Message broadcasted successfully.");
    } catch (error) {
      console.error("Error sending voice:", error);
      socket.emit("error", "Failed to send voice message");
    }
  });

  socket.on("sendFile", async (data) => {
    try {
      const { chatRoomId, user, fileBuffer, fileName, mimeType } = data;

      const buffer = Buffer.from(fileBuffer);
      const file = formatChatImage(buffer, fileName); // reuse your helper or rename if needed

      const result = await cloudinary.uploader.upload(file, {
        resource_type: "raw", // very important for files!
        public_id: `${Date.now()}_${fileName}`,
        access_mode: "public",
      });

      const newMessage = new Message({
        chatRoomId,
        user,
        fileUrl: result.secure_url,
        fileName,
        type: "file",
      });

      await newMessage.save();
      await newMessage.populate("user");
      io.to(chatRoomId).emit("receiveMessage", {
        _id: newMessage._id,
        user: newMessage.user,
        fileUrl: result.secure_url,
        fileName,
        type: "file",
        timestamp: newMessage.createdAt,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      socket.emit("error", "Failed to upload file");
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
  });
});

export { app, io, server };

// app.post("/api/upload", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const resourceType = req.file.mimetype.startsWith("image/")
//       ? "image"
//       : req.file.mimetype.startsWith("audio/")
//       ? "video"
//       : "auto";

//     const result = await uploadToCloudinary(req.file.buffer, resourceType);

//     res.json({
//       url: result.secure_url,
//       resourceType,
//       duration: req.body.duration, // For voice messages
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({ error: "Failed to upload file" });
//   }
// });
