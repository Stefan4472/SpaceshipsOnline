/*
Server-side code. Receives control updates from players and broadcasts them
to other connected players. TODO: RUN AUTHORITATIVE GAME STATE
*/
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html');
});

// var texture_atlas

// buffered player control inputs since the last game update
var input_buffer = [];
var map_width = 1000, map_height = 1000;
var players = [];  // players in the game
var bullets = [];  // bullets in the game
var power_ups = [];

function addPlayer(player_id) {
  console.log("Adding player " + player_id);
  // add player with given id at random (x, y)
  players.push(new Spaceship(player_id, randomInt(100, map_width - 100),
    randomInt(100, map_height - 100), texture_atlas));
}

function disconnectPlayer(player_id) {
  console.log("Disconnecting player " + player_id);
  console.log("PLAYER DISCONNECT FUNCTIONALITY HAS NOT BEEN IMPLEMENTED YET");
}

// keep track of id of last-connected player. Incremented each time a new
// player connects
server.lastPlayderID = 0;

// listen for new connections on port 8081
server.listen(process.env.PORT || 8081, function() {
  console.log('Listening on '+ server.address().port);
});

// handle socket connection
io.on('connection', function(socket) {
  // 'newplayer' command: create data for the new player's state
  socket.on('new_player_request', function() {
    socket.player_id = server.lastPlayderID++;
    console.log("New Player Request. Assigned id " + socket.player_id);
    addPlayer(socket.player_id);

    // // send array of all connected players to the new socket
    // socket.emit('all_players', { players: getAllPlayers(), your_id: socket.player.id });
    // // broadcast the new player to all connections
    // socket.broadcast.emit('player_joined', socket.player);

    // receive control input from the player: package into JSON and add
    // to input buffer
    socket.on('control_input', function(data) {
      input_buffer.push({
        id: socket.player_id,
        up_pressed: data.up_pressed,
        down_pressed: data.down_pressed,
        left_pressed: data.left_pressed,
        right_pressed: data.right_pressed,
        space_pressed: data.space_pressed
      });
      console.log('Received input update from id ' + socket.player_id);
      // socket.broadcast.emit('control_update', player_input);
      // io.emit('control_update', player_input);
    });

    // handle a player disconnecting: emit to other connections
    socket.on('disconnect', function() {
      console.log("Received player disconnect " + socket.player_id);
      // io.emit('player_disconnect', socket.player.id);
      disconnectPlayer(socket.player_id);
    });
  });

  socket.on('test', function() {
    console.log('Test received');
  });
});

// function getAllPlayers() {
//   var players = [];
//   Object.keys(io.sockets.connected).forEach(function(socketID) {
//     var player = io.sockets.connected[socketID].player;
//     if (player) {
//       players.push(player);
//     }
//   });
//   return players;
// }

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

// game loop
var interval = setInterval(function() {
  console.log("Running game update loop...");
  for (var i = 0)
  console.log("Done");
}, 1000);
