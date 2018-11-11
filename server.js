/*
Server-side code. Receives control updates from players and broadcasts them
to other connected players. TODO: RUN AUTHORITATIVE GAME STATE
*/
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html');
});

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
    socket.player = {
      id: server.lastPlayderID++,
      x: server.lastPlayderID * 10, //randomInt(100, 900),
      y: server.lastPlayderID * 10 //randomInt(100, 900)
    };

    console.log("New Player Request. Assigned id " + socket.player.id);

    // send array of all connected players to the new socket
    socket.emit('all_players', { players: getAllPlayers(), your_id: socket.player.id });
    // broadcast the new player to all connections
    socket.broadcast.emit('player_joined', socket.player);

    // receive control input from the player: package into JSON and broadcast
    socket.on('control_input', function(data) {
      player_input = {
        id: socket.player.id,
        up_pressed: data.up_pressed,
        down_pressed: data.down_pressed,
        left_pressed: data.left_pressed,
        right_pressed: data.right_pressed,
        space_pressed: data.space_pressed
      };
      console.log('Received input update from id ' + socket.player.id);
      socket.broadcast.emit('control_update', player_input);
      // io.emit('control_update', player_input);
    });

    // handle a player disconnecting: emit to other connections
    socket.on('disconnect', function(){
      io.emit('player_disconnect', socket.player.id);
    });
  });

  socket.on('test', function() {
    console.log('Test received');
  });
});

function getAllPlayers(){
  var players = [];
  Object.keys(io.sockets.connected).forEach(function(socketID) {
    var player = io.sockets.connected[socketID].player;
    if (player) {
      players.push(player);
    }
  });
  return players;
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}
