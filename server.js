// Load modules
var path = require('path');
var express = require('express');
var app = express();
var http = require('http');
var PeerServer = require('peer').PeerServer;

// Environment Variables
app.set('port', process.env.PORT || 8000);
app.use(express.static(path.join(__dirname, 'web')));

// Start HTTP Server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Start Peer server
var server = new PeerServer({port: 9000});

// Peer Server Listeners
server.on('connection', function(id) { 
	console.log('User ' + id + ' is connected.');
})

server.on('disconnect', function(id) {
	console.log('User ' + id + ' is disconnected.');
})

// Handle Ctrl+C events gracefully 	
process.on('SIGINT', function() {
	console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
	console.log("Exiting...");
  	process.exit();
});