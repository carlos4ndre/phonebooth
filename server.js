// Load modules
var express = require('express');
var app = express();
var http = require('http');
var path = require('path');

// Environment Variables
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'web')));

// Start HTTP listener
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});