/*
Server-side code. Receives control updates from players and broadcasts them
to other connected players. TODO: RUN AUTHORITATIVE GAME STATE
*/
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var game_lobby = require('./js/server/game_lobby.js');

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html');
});

// listen for new connections on port 8081
server.listen(process.env.PORT || 8081, function() {
  console.log('Listening on '+ server.address().port);
});

// create the game instance
var lobby = new game_lobby.GameLobby(io);

var num_connections = 0;

// handle socket connection
io.on('connection', function(socket) {

  num_connections++;
  // create player object using the socket
  var player = { 
    socket: socket,
    username: 'Guest-' + num_connections.toString() 
  };

  // add new player to game
  lobby.addPlayer(player);
});
