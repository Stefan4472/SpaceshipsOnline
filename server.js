/*
Server-side code. Receives control updates from players and broadcasts them
to other connected players. TODO: RUN AUTHORITATIVE GAME STATE
*/
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var game_driver = require('./js/server/game_driver.js');

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
var game_instance = new game_driver.Game();
// start the game lobby
game_instance.start();

var num_connections = 0;

// handle socket connection
io.on('connection', function(socket) {

  num_connections++;

  // 'newplayer' command: create data for the new player's state
  socket.on('request_matchmaking', function(preferences) {

    console.log("user asking to join a game");

    // TODO: GET USERNAME FROM DATABASE OR SOMETHING
    socket.username = 'Guest-' + num_connections.toString();

    // add new player to game
    // returns object with player id, position, etc.
    game_instance.addPlayer(socket);
  });

  socket.on('test', function() {
    console.log('Test received');
  });
});
