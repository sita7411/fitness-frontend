// src/utils/socket.js
import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      withCredentials: true,
      autoConnect: true,
    });
    console.log("Admin socket instance created");
  }
  return socket;
};