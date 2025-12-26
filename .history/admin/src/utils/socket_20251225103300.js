// src/utils/socket.js

import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket;

const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket"],  // Direct WebSocket only – no polling fallback
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected successfully! ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  }
  return socket;
};

export default getSocket();