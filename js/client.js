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
  Client.socket.emit('new_player_request');
};

Client.sendControls = function(up, down, left, right, space) {
  Client.socket.emit('control_input', { up_pressed: up, down_pressed: down,
    left_pressed: left, right_pressed: right, space_pressed: space });
};

Client.socket.on('player_joined', function(data){
    game.addPlayer(data.id, data.x, data.y);
});

Client.socket.on('all_players', function(data) {
  game.initGameState(data.players, data.your_id);
  console.log("Set Game player id to " + game.player_id);

  Client.socket.on('control_update', function(data) {
    game.inputControls(data.id, data.up_pressed, data.down_pressed,
      data.left_pressed, data.right_pressed, data.space_pressed);
      // Game.movePlayer(data.id,data.x,data.y);
  });

  Client.socket.on('player_disconnect', function(id) {
    game.removePlayer(id);
  });
});
