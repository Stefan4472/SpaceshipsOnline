/* Server entry point */
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Game = require('./js/server/game.js').Game;

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html');
});

// Listen for new connections on port 8081
server.listen(process.env.PORT || 8081, function() {
  console.log('Listening on '+ server.address().port);
});

var game = new Game(io);

// Handle socket connection
io.on('connection', function(socket) {
  console.log('Got a new connection!');
  game.newPlayer(socket);
});
