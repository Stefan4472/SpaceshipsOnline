/*
client-side lobby representation.
Runs the Game state once confirmation from the server is made.
*/
class ClientLobby {
  constructor(canvas, client) {
    console.log("client created lobby");
    this.canvas = canvas;
    this.client = client;
    this.lobby_name = "";
    this.player_id = -1;

    // create the game instance
    this.game_instance = new Game(canvas);

    this.num_players = 0;  // TODO: RENAME NUM_CONNECTED_PLAYERS
    this.min_players = 0;
    this.max_players = 0;

    this.players = new Map();
    console.log("Players has " + this.players.length + " entries");
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
    // game.removePlayer(player_id);
  }

  onLobbyStartCountdown(ms_left) {
    console.log("Lobby starting in " + (ms_left / 1000) + " seconds");

    if (ms_left <= 0) {
      // switch to game screen
    }
  }

  onReceiveInitState(state) {
    // pass along to the game
    this.game_instance.onReceiveInitState(state);
    this.game_instance.setPlayerId(this.player_id);
  }

  onGameStartCountdown(ms_left) {
    console.log("Game starting in " + (ms_left / 1000) + " seconds");
  }

  onGameUpdate(game_state) {
    console.log("Received game update");
    console.log("" + JSON.stringify(game_state, null, 2));
  }

  onGameOver() {
    console.log("Game over signal received");
  }

  onPingRequest(data) {
    console.log("Received a ping request with id " + data.ping_id);
    client.socket.emit('ping_response', data.ping_id);
  }

  onLobbyClosed(message) {
    console.log("Lobby was closed, reason: '" + message + "'");
  }
}
