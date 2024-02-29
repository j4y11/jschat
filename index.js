const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");

const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);

const gamedirectory = path.join(__dirname, "html");

app.use(express.static(gamedirectory));

httpserver.listen(3000);

const rooms = new Map();
const activeUsernames = new Set();

io.on("connection", function (socket) {
  socket.on("checkUsername", function (username, callback) {
    if (activeUsernames.has(username)) {
      callback(false);
    } else {
      callback(true);
    }
  });

  socket.on("join", function (room, username) {
    if (username !== "") {
      if (activeUsernames.has(username)) {
        socket.emit("usernameError", "Username already taken. Please choose a different username.");
        return;
      }

      // Remove the username from disconnectedUsernames if present
      activeUsernames.delete(username);

      const previousRoom = rooms.get(socket.id);
      if (previousRoom) {
        // Emit a leave message to the previous room
        socket.to(previousRoom).emit("recieve", "Server: " + username + " has left the chat.");
      }

      // Update the room and username
      rooms.set(socket.id, room);
      activeUsernames.add(username);
      socket.leaveAll();
      socket.join(room);
      io.in(room).emit("recieve", "Server: " + username + " has entered the chat.");
      socket.emit("join", room);
      socket.username = username;
    }
  });

  socket.on("send", function (message) {
    io.in(rooms.get(socket.id)).emit("recieve", socket.username + ": " + message);
  });

  socket.on("disconnect", function () {
    const username = socket.username;
    if (username) {
      // Move the username to disconnectedUsernames
      activeUsernames.delete(username);

      const room = rooms.get(socket.id);
      if (room) {
        io.in(room).emit("recieve", "Server: " + username + " has left the chat.");
      }
    }
    rooms.delete(socket.id);
  });
});
