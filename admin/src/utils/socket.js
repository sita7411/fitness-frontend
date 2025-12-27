// src/utils/socket.js
import { io } from "socket.io-client";

let socket = null;

const API_URL = import.meta.env.VITE_API_URL;

export const getSocket = () => {
  if (!socket) {
    socket = io(API_URL, {
      withCredentials: true,
      transports: ["websocket"], 
    });
    console.log("Admin socket instance created");
  }
  return socket;
};
