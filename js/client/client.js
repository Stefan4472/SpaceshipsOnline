/*
Client socket code. Communicates with the server and can update client-side
game state.
*/
var Client = {};
Client.socket = io.connect();

Client.sendTest = function(){
    console.log("Sending test...");
    Client.socket.emit('test');
};

Client.askNewPlayer = function() {
  Client.socket.emit('request_matchmaking');
};

Client.sendControls = function(up, down, left, right, space) {
  Client.socket.emit('control_input', { up_pressed: up, down_pressed: down,
    left_pressed: left, right_pressed: right, space_pressed: space });
};

Client.socket.on('game_joined', function(data) {
  console.log("Client: Joined game, msg = " + data.msg);
  // TODO: NEED PLAYER'S ID, SPACESHIP STARTING PLACE+ATTRIBUTES, MAP DATA


  Client.socket.on('player_disconnect', function(player_id) {
    game.removePlayer(player_id);
  });

  Client.socket.on('player_joined', function(player_data) {
    // game.addPlayer(data.id, data.x, data.y);  // TODO: USE ALL DATA
  });

  // handle receiving gamestate
  Client.socket.on('game_update', function(game_state) {

  });

  // handle lobby-closed signal
  Client.socket.on('lobby_closed', function(message) {

  });
});
