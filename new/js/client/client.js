/*
Client socket code for sending on the socket. Only includes emit functions.
Create listeners on your own.
*/
class Client {
  constructor() {
    // Connect to the server and get socket instance
    this.socket = io.connect();

    // // Get reference to game canvas
    // this.canvas = document.getElementById("gameCanvas");
    // this.context = this.canvas.getContext("2d");
    // // Create game instance
    // this.game = new ClientGame(this, this.canvas);
    // var _game = this.game;

    // Register handler functions for specific socket messages
    // this.socket.on(Messages.INIT_STATE,
    //   function(state) { _game.onReceiveInitState(state); });
    // this.socket.on(Messages.GAME_UPDATE,
    //   function(game_state) { _game.onGameUpdate(game_state); });
    // this.socket.on(Messages.PLAYER_DISCONNECTED,
    //     function(player_id) { _game.onPlayerDisconnected(player_id); });
    this.socket.on(Messages.ECHO,
      function(reply) { console.log("Received echo '" + reply.message + "'"); });
  }

  // Sends a request to join the game
  joinGame() {
    this.socket.emit(Messages.JOIN_GAME);
  }

  // Sends player input
  sendInput(up, down, left, right, space) {
    this.socket.emit(Messages.SEND_INPUT, { up_pressed: up, down_pressed: down,
      left_pressed: left, right_pressed: right, space_pressed: space });
  }

  // Sends an echo request (testing purposes)
  echo(message) {
    console.log("Sending echo '" + message + "'");
    this.socket.emit(Messages.ECHO, { message: message });
  }
}
