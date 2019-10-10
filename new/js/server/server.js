var Messages = require('./../shared/messages.js').Messages;
var ServerGame = require('./../server/server_game.js').ServerGame;

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
      _this.player_sockets[player_id] = socket;

      // TODO: REPLY WITH THE PLAYER'S ASSIGNED USERNAME. CLIENT SHOULD WAIT TO RECEIVE THE REPLY.
      socket.on(Messages.JOIN_GAME, function() {
        console.log("Received a request to join the game");
        _this.game.addPlayer(player_id, username);
      });

      // Reply to an echo
      socket.on(Messages.ECHO, function(echo) {
        console.log("Received an echo request: '" + echo.message + "'");
        socket.emit(Messages.ECHO, { message: echo.message });
      });
    });
  }

  // Sends a request to join the game
  sendInitialState(player_id, game_state) {
    var player_socket = this.player_sockets[player_id];
    player_socket.emit(Messages.INIT_STATE, { 'state': game_state });
  }

  sendGameUpdate(game_state) {
    this.io.emit(Messages.GAME_UPDATE, { 'state': game_state });
  }

  // TODO: THIS NEEDS TO BE TRIGGERED BY THE SOCKET INSTANCE, AND CALL A METHOD IN THE GAME 
  // sendPlayerDisconnected(player_id) {
  //   this.io.emit(Messages.PLAYER_DISCONNECTED, { 'player_id': player_id });
  // }
}

module.exports.Server = Server;
