// Load modules
var path = require('path');
var express = require('express');
var app = express();
var httpServer = require('http').Server(app);;
var PeerServer = require('peer').PeerServer;
var io = require('socket.io')(httpServer);

// Global Variables
var chatUsers = {};

// Environment Variables
app.set('port', process.env.PORT || 8000);
app.use(express.static(path.join(__dirname, 'web')));

// Start HTTP Server and socket.io listeners
io.on('connection', function(socket){
	socket.on('register', function(chatUser){
		console.log('Register new user: ' + chatUser.nickname);
		socket.nickname = chatUser.nickname;
		chatUsers[chatUser.nickname] = chatUser;
		io.sockets.emit('updateUserList', chatUsers);
	});

	socket.on('sendMessage', function(message) {
		console.log('Got message from ' + message.nickname + '.');
		if(message.text) {
			io.sockets.emit('sendMessage', message);
		}
	});

	socket.on('chatRequest', function(request) {
		var sender = request.sender;
		var receiver = request.receiver;
		console.log( sender.nickname + ' is sending a chat request to ' + receiver.nickname + '.');
		if(receiver.sessionId) {
			io.to(receiver.sessionId).emit('chatRequest', sender);
		}
	});

	socket.on('disconnect', function(){
		console.log( socket.nickname + ' has disconnected from the chat.');
		// delete user from chatUsers list and notify the other users
		if(chatUsers.hasOwnProperty(socket.nickname)) { delete chatUsers[socket.nickname]; }
		io.sockets.emit('updateUserList', { users: chatUsers });
	});
});
httpServer.listen(app.get('port'));

// Start Peer server and Listeners
var peerServer = new PeerServer({port: 9000});
peerServer.on('connection', function(id) {})

// Handle Ctrl+C events gracefully 	
process.on('SIGINT', function() {
	console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
	console.log("Exiting...");
	process.exit();
});