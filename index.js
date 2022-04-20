const express = require("express");
const socket = require("socket.io");
const app = express();

//Starts the server

let server = app.listen(process.env.PORT || 4000, function () {
  console.log("Server is running");
});

app.use(express.static("public"));

//Upgrades the server to accept websockets.

let io = socket(server);

//Triggered when a client is connected.

io.on("connection", function (socket) {
  console.log("User Connected :" + socket.id);

  //Triggered when a peer hits the join room button.

  socket.on("join", function (roomName) {
    let rooms = io.sockets.adapter.rooms;
    let room = rooms.get(roomName);

    //room == undefined when no such room exists.
    if (room == undefined) {
      socket.join(roomName);
      socket.emit("created");
    } else if (room.size == 1) {
      //room.size == 1 when one person is inside the room.
      console.log("server join 2"," time: ",new Date().getTime())
      socket.join(roomName);
      socket.emit("joined");
    } else {
      //when there are already two people inside the room.
      socket.emit("full");
    }
    // console.log(rooms);
  });

  //Triggered when the person who joined the room is ready to communicate.
  socket.on("ready", function (roomName) {
    console.log("server ready"," time: ",new Date().getTime())
    socket.broadcast.to(roomName).emit("ready"); //Informs the other peer in the room.
  });

  //Triggered when server gets an icecandidate from a peer in the room.

  socket.on("candidate", function (candidate, roomName) {
    console.log("server candidate "," time: ",new Date().getTime())
    // console.log(candidate);
    socket.broadcast.to(roomName).emit("candidate", candidate); //Sends Candidate to the other peer in the room.
  });

  //Triggered when server gets an offer from a peer in the room.

  socket.on("offer", function (offer, roomName) {
    console.log("server offer "," time: ",new Date().getTime())
    socket.broadcast.to(roomName).emit("offer", offer); //Sends Offer to the other peer in the room.
  });

  //Triggered when server gets an answer from a peer in the room.

  socket.on("answer", function (answer, roomName) {
    console.log("server answer  "," time: ",new Date().getTime())
    socket.broadcast.to(roomName).emit("answer", answer); //Sends Answer to the other peer in the room.
  });
});
