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

Client.requestMatchmaking = function() {
  Client.socket.emit('request_matchmaking');
};

Client.sendControls = function(up, down, left, right, space) {
  Client.socket.emit('control_input', { up_pressed: up, down_pressed: down,
    left_pressed: left, right_pressed: right, space_pressed: space });
};

// Client.socket.on('you_joined_lobby', lobby.onLobbyJoined);

Client.socket.on('player_joined_lobby', function(player_data) {
  console.log("A player joined the lobby with id " + player_data.player_id +
    " and username " + player_data.username);
});

Client.socket.on('disconnected', function(reason) {
  console.log("You got disconnected for reason: '" + reason + "'");
});

Client.socket.on('player_disconnected', function(data) {
  console.log("Player with username " + data.player_id + " disconnected");
  // game.removePlayer(player_id);
});

Client.socket.on('lobby_start_countdown', function(ms_left) {
  console.log("Lobby starting in " + (ms_left / 1000) + " seconds");
});

Client.socket.on('game_start_countdown', function(ms_left) {
  console.log("Game starting in " + (ms_left / 1000) + " seconds");
});

Client.socket.on('game_update', function(game_state) {
  console.log("Received game update");
  console.log("" + JSON.stringify(game_state, null, 2));
});

Client.socket.on('ping_request', function(data) {
  console.log("Received a ping request with id " + data.ping_id);
  Client.socket.emit('ping_response', data.ping_id);
});

Client.socket.on('lobby_closed', function(message) {
  console.log("Lobby was closed, reason: '" + message + "'");
});
