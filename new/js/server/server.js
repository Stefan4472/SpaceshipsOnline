var Messages = require('./../shared/messages.js').Messages;
var ServerGame = require('./../server/server_game.js').ServerGame;

// Manages socket connections and message sending/receiving
// for the backend game ('server_game.js').
class Server {

  constructor(server, io, port_num) {
    this.io = io;
    this.port_num = port_num;
    // TODO: SOCKET ROOM ID?

    // listen for new connections on port 8000
    server.listen(process.env.PORT || port_num, function() {
      console.log('Server instantiated, listening on '+ server.address().port);
    });

    // Number of users connected to this server
    this.num_connections = 0;
    // Create mapping of { player_id -> socket instance }
    this.player_sockets = new Map();
    // Create game isntance
    this.game = new ServerGame(this);

    // Set up the socket
    var _this = this;
    io.on('connection', function(socket) {
      var player_id = ++_this.num_connections;
      var username = 'Guest-' + player_id.toString();
      console.log("New connection, username will be " + username);
      // Register socket under player_id
      _this.player_sockets.set(player_id, socket);

      // TODO: REPLY WITH THE PLAYER'S ASSIGNED USERNAME. CLIENT SHOULD WAIT TO RECEIVE THE REPLY.
      // Handles client sending a JOIN_GAME request.
      // Adds the player to the game.
      socket.on(Messages.JOIN_GAME, function() {
        console.log("Received a request to join the game");
        _this.game.addPlayer(player_id, username);
      });

      // Replies to an echo.
      socket.on(Messages.ECHO, function(echo) {
        console.log("Received an echo request: '" + echo.message + "'");
        socket.emit(Messages.ECHO, { message: echo.message });
      });
    });
  }

  // Sends state information to the given player_id.
  // This is enough for the player to set up the game client-side.
  sendInitialState(player_id, init_state) {
    console.log('Sending initial state to ' + player_id);
    var player_socket = this.player_sockets.get(player_id);
    player_socket.emit(Messages.INIT_STATE, init_state);
  }

  // Sends updated game state to all connected players.
  sendGameUpdate(game_state) {
    this.io.emit(Messages.GAME_UPDATE, game_state);
  }

  // Notifies all players that a new player has joined.
  // Also has initial information regarding the player's ship.
  sendPlayerJoined(player_info) {
    // TODO: SEND TO EVERYONE EXCEPT THE PLAYER WHO JUST CONNECTED
    // var player_socket = this.player_sockets[player_id];
    this.io.emit(Messages.PLAYER_JOINED, player_info);
  }

  // TODO: THIS NEEDS TO BE TRIGGERED BY THE SOCKET INSTANCE, AND CALL A METHOD IN THE GAME
  sendPlayerDisconnected(player_id) {
    this.io.emit(Messages.PLAYER_DISCONNECTED, { 'player_id': player_id });
  }
}

module.exports.Server = Server;
