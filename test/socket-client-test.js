import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  // Force WebSocket-only with fallback
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  // Protocol configuration
  upgrade: false,
  forceNew: true,
  // Debug settings
  query: {
    clientType: "tester",
  },
});

socket.on("connect", () => {
  console.log("✅ Connected!");
  socket.emit("joinCommunity", "test-room");
});

socket.on("connect_error", (err) => {
  console.log("❌ Connection failed:", err.message);
});

socket.on("receiveMessage", (msg) => {
  console.log("📨 New message:", msg);
});
