// Load modules
var config = require('config');
var path = require('path');
var express = require('express');
var app = express();
var httpServer = require('http').Server(app);;
var PeerServer = require('peer').PeerServer;
var io = require('socket.io')(httpServer);

// Global Variables
var chatUsers = {};
var nodeHostname = config.get('Node.hostname');
var peerHostname = config.get('Peer.hostname');
var nodeHttpPort = config.get('Node.http.port') || 8000;
var peerHttpPort = config.get('Peer.http.port') || 9000;

// Environment Variables
app.use(express.static(path.join(__dirname, 'web')));

// Start HTTP Server and socket.io listeners
io.on('connection', function(socket){
  socket.on('register', function(chatUser){
    console.log('Register new user: ' + chatUser.userId);
    socket.userId = chatUser.userId;
    chatUsers[chatUser.userId] = chatUser;
    io.sockets.emit('updateUserList', chatUsers);
  });

  socket.on('sendMessage', function(message) {
    var sender = message.sender;
    var receiver = message.receiver;
    console.log('Got message from ' + sender.userId + '.');
    if(message.text) {
      if(receiver && receiver.sessionId) { io.to(receiver.sessionId).emit('sendMessage', message); }
      else { io.sockets.emit('sendMessage', message); }
    }
  });

  socket.on('chatRequest', function(request) {
    var sender = request.sender;
    var receiver = request.receiver;
    console.log( sender.userId + ' is sending a chat request to ' + receiver.userId + '.');
    if(receiver.sessionId) {
      io.to(receiver.sessionId).emit('chatRequest', request);
    }
  });

  socket.on('startChat', function(request) {
    var sender = request.sender;
    var receiver = request.receiver;
    console.log('Chat request accepted by ' + receiver.userId);
    if(receiver.sessionId) {
      io.to(sender.sessionId).emit('startChat', receiver);
    }
  });

  socket.on('cancelChat', function(request) {
    var sender = request.sender;
    var receiver = request.receiver;
    console.log('Chat request cancelled by ' + receiver.userId);
    if(receiver.sessionId) {
      io.to(sender.sessionId).emit('cancelChat', receiver);
    }
  });

  socket.on('disconnect', function(){
    console.log( socket.userId + ' has disconnected from the chat.');
    // delete user from chatUsers list and notify the other users
    if(chatUsers.hasOwnProperty(socket.userId)) { delete chatUsers[socket.userId]; }
    io.sockets.emit('updateUserList', chatUsers);
  });
});
httpServer.listen(nodeHttpPort, nodeHostname);

// Start Peer server and Listeners
var peerServer = new PeerServer({port: peerHttpPort});
peerServer.on('connection', function(id) {});
peerServer.on('disconnect', function(id) {});

// Handle Ctrl+C events gracefully
process.on('SIGINT', function() {
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
  console.log("Exiting...");
  process.exit();
});
