/*
client-side lobby representation.
Runs the Game state once confirmation from the server is made.
*/
class ClientLobby {
  constructor(canvas, client) {
    console.log("client created lobby");
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");
    this.client = client;
    this.lobby_name = "";
    this.player_id = -1;

    // create the game instance
    this.game_instance = new Game(canvas);

    this.num_players = 0;  // TODO: RENAME NUM_CONNECTED_PLAYERS
    this.min_players = 0;
    this.max_players = 0;

    this.players = new Map();

    this.context.fillStyle = '#000000';
    this.context.font = "30px Arial";
    this.context.fillText("Waiting to Join a Lobby", 0, 100);
    // TODO: ONLOAD HANDLER

    var lobby = this;
    var game = this.game_instance;

    // setup socket message handlers
    client.socket.on('you_joined_lobby',
      function(data) { lobby.onLobbyJoined(data); });
    client.socket.on('player_joined_lobby',
      function(data) { lobby.onPlayerJoined(data); });
    client.socket.on('disconnected',
      function(reason) { lobby.onDisconnect(reason); });
    client.socket.on('player_disconnected',
      function(data) { lobby.onPlayerDisconnected(data); });
    client.socket.on('lobby_start_countdown',
      function(ms_left) { lobby.onLobbyStartCountdown(ms_left); });
    client.socket.on('init_state',
      function(state) { lobby.onReceiveInitState(state); });
    client.socket.on('game_start_countdown',
      function(ms_left) { lobby.onGameStartCountdown(ms_left); });
    client.socket.on('game_update',
      function(game_state) { lobby.onGameUpdate(game_state); });
    client.socket.on('respawn_countdown',
      function(ms_left) { lobby.onRespawnCountdown(ms_left); });  // TODO
    client.socket.on('game_over',
      function() { lobby.onGameOver(); });
    client.socket.on('ping_request',
      function(data) { lobby.onPingRequest(data); });
    client.socket.on('lobby_closed',
      function(reason) { lobby.onLobbyClosed(reason); });
  }

  onLobbyJoined(data) {
    console.log("Joined a lobby! Data received " + JSON.stringify(data, null, 2));

    this.lobby_name = data.lobby_name;
    this.player_id = data.your_id;
    this.min_players = data.min_players;
    this.max_players = data.max_players;

    // save connected player data
    for (var player of data.player_data) {
      this.players.set(player.player_id, { username: player.username });
    }

    if (data.player_data.length < this.min_players) {
      console.log("Waiting for players");
      this.context.fillStyle = '#FFFFFF';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.font = "30px Arial";
      this.context.fillStyle = '#000000';
      this.context.fillText("Waiting for another player to join...", 0, 100);
    }
  }

  onPlayerJoined(player_data) {
    console.log("A player joined the lobby with id " + player_data.player_id +
      " and username " + player_data.username);
    this.num_players++;
    console.log("Now we have " + this.num_players + " players");
    this.players.set(player_data.player_id, { username: player_data.username });
  }

  onDisconnect(reason) {
    console.log("You got disconnected for reason: '" + reason + "'");
  }

  // TODO: GAME LOG HANDLES
  onPlayerDisconnected(data) {
    console.log("Player with username " + data.player_id + " disconnected");
    this.num_players--;

    if (this.in_game) {
      this.game_instance.onPlayerDisconnected(data.player_id);
    }
  }

  onLobbyStartCountdown(ms_left) {
    console.log("Lobby starting in " + (ms_left / 1000) + " seconds");

    // switch to game screen
    if (ms_left <= 0) {
      this.in_game = true;
    }
  }

  onReceiveInitState(state) {
    console.log("Client Lobby: state is " + JSON.stringify(state, null, 2));
    // pass along to the game
    this.game_instance.onReceiveInitState(this.player_id, this.players, state);
  }

  onGameStartCountdown(ms_left) {
    this.game_instance.onGameStartCountdown(ms_left);
  }

  onGameUpdate(game_state) {
    this.game_instance.onGameUpdate(game_state);
  }

  onRespawnCountdown(ms_left) {  // TODO

  }

  onGameOver() {
    this.game_instance.onGameOver();
  }

  onPingRequest(data) {
    console.log("Received a ping request with id " + data.ping_id);
    client.socket.emit('ping_response', data.ping_id);
  }

  onLobbyClosed(message) {
    this.game_instance.onGameTerminated();
    console.log("Lobby was closed, reason: '" + message + "'");
  }
}
