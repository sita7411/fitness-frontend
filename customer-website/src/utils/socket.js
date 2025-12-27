import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"], 
    });
    console.log("New socket instance created");
  }
  return socket;
};
